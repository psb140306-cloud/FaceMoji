import asyncio
import logging
import time
from dataclasses import dataclass, field

from app.models.enums import GenerationStatus, StyleType

logger = logging.getLogger(__name__)


@dataclass
class StickerResult:
    expression: str
    sort_order: int
    image_url: str | None = None
    error: str | None = None


@dataclass
class Job:
    job_id: str
    user_id: str
    generation_id: str
    image_url: str
    style: StyleType
    expressions: list[str]
    status: GenerationStatus = GenerationStatus.PENDING
    progress: int = 0
    completed_stickers: list[StickerResult] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)


class JobQueue:
    """인메모리 비동기 작업 큐 (MVP용)."""

    def __init__(self, max_concurrent: int = 50):
        self._jobs: dict[str, Job] = {}
        self._semaphore = asyncio.Semaphore(max_concurrent)

    def add_job(self, job: Job) -> None:
        self._jobs[job.job_id] = job

    def get_job(self, job_id: str) -> Job | None:
        return self._jobs.get(job_id)

    def get_job_status(self, job_id: str) -> dict | None:
        job = self._jobs.get(job_id)
        if not job:
            return None
        return {
            "job_id": job.job_id,
            "generation_id": job.generation_id,
            "status": job.status.value,
            "progress": job.progress,
            "total": len(job.expressions),
            "completed_stickers": [
                {
                    "expression": s.expression,
                    "sort_order": s.sort_order,
                    "image_url": s.image_url,
                }
                for s in job.completed_stickers
                if s.image_url
            ],
            "errors": job.errors,
        }

    async def process_job(self, job: Job) -> None:
        """비동기로 24개 스티커를 순차 생성 → Storage 저장 → DB 기록."""
        from app.services.fal_client import generate_single_sticker
        from app.services.supabase_client import (
            upload_sticker_to_storage,
            insert_sticker_record,
            update_generation_status,
            delete_source_image,
        )

        async with self._semaphore:
            job.status = GenerationStatus.PROCESSING
            await update_generation_status(job.generation_id, "processing")
            logger.info(f"Processing job {job.job_id}, {len(job.expressions)} stickers")

            for i, expression in enumerate(job.expressions):
                retry_count = 0
                max_retries = 2

                while retry_count <= max_retries:
                    try:
                        result = await generate_single_sticker(
                            image_url=job.image_url,
                            expression=expression,
                            style=job.style,
                        )

                        image_url = None
                        if isinstance(result, dict):
                            if "image" in result:
                                img = result["image"]
                                image_url = img.get("url") if isinstance(img, dict) else img
                            elif "images" in result and result["images"]:
                                image_url = result["images"][0].get("url")
                            elif "output" in result:
                                output = result["output"]
                                if isinstance(output, dict):
                                    image_url = output.get("url") or output.get("image")

                        # Storage에 업로드 + DB 기록
                        storage_path = None
                        if image_url and job.user_id:
                            storage_path = await upload_sticker_to_storage(
                                user_id=job.user_id,
                                generation_id=job.generation_id,
                                sort_order=i + 1,
                                expression=expression,
                                image_url=image_url,
                            )
                            if storage_path:
                                thumb_path = storage_path.replace(".png", "_thumb.png")
                                thumb_path = thumb_path.replace(
                                    f"/{job.generation_id}/",
                                    f"/{job.generation_id}/",
                                )
                                await insert_sticker_record(
                                    generation_id=job.generation_id,
                                    sort_order=i + 1,
                                    expression=expression,
                                    image_path=storage_path,
                                    thumbnail_path=thumb_path,
                                )

                        job.completed_stickers.append(
                            StickerResult(
                                expression=expression,
                                sort_order=i + 1,
                                image_url=image_url,
                            )
                        )
                        job.progress = i + 1
                        break

                    except Exception as e:
                        retry_count += 1
                        logger.warning(
                            f"Job {job.job_id} sticker {expression} attempt {retry_count} failed: {e}"
                        )
                        if retry_count > max_retries:
                            job.errors.append(f"{expression}: {str(e)}")
                            job.completed_stickers.append(
                                StickerResult(
                                    expression=expression,
                                    sort_order=i + 1,
                                    error=str(e),
                                )
                            )
                            job.progress = i + 1
                        else:
                            await asyncio.sleep(retry_count * 2)

            # 최종 상태 결정
            failed_count = len([s for s in job.completed_stickers if s.error])
            success_count = len(job.completed_stickers) - failed_count

            if failed_count == len(job.expressions):
                job.status = GenerationStatus.FAILED
                await update_generation_status(job.generation_id, "failed", sticker_count=0)
            else:
                job.status = GenerationStatus.COMPLETED
                await update_generation_status(
                    job.generation_id, "completed", sticker_count=success_count
                )

            # PIPA: 원본 사진 즉시 삭제
            if job.user_id:
                await delete_source_image(job.user_id, job.generation_id)

            logger.info(
                f"Job {job.job_id} finished: status={job.status}, "
                f"completed={success_count}, failed={failed_count}"
            )

    def cleanup_old_jobs(self, max_age_seconds: int = 3600) -> int:
        """1시간 이상 된 완료 작업 정리."""
        now = time.time()
        to_remove = [
            job_id
            for job_id, job in self._jobs.items()
            if now - job.created_at > max_age_seconds
            and job.status in (GenerationStatus.COMPLETED, GenerationStatus.FAILED)
        ]
        for job_id in to_remove:
            del self._jobs[job_id]
        return len(to_remove)


# 싱글턴 인스턴스
job_queue = JobQueue()
