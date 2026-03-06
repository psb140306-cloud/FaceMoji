import httpx
import logging

from app.config import settings

logger = logging.getLogger(__name__)

_headers = {
    "apikey": settings.supabase_service_role_key,
    "Authorization": f"Bearer {settings.supabase_service_role_key}",
}


async def upload_sticker_to_storage(
    user_id: str,
    generation_id: str,
    sort_order: int,
    expression: str,
    image_url: str,
) -> str | None:
    """fal.ai 결과 이미지를 다운로드 → Supabase Storage에 업로드 + 워터마크 썸네일 생성."""
    from app.services.watermark import create_watermarked_thumbnail

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            # 1. fal.ai에서 이미지 다운로드
            img_resp = await client.get(image_url)
            img_resp.raise_for_status()
            image_bytes = img_resp.content

            # 2. 원본 스티커 → fm-stickers 버킷에 업로드
            file_path = f"{user_id}/{generation_id}/{sort_order:02d}_{expression}.png"
            upload_url = (
                f"{settings.supabase_url}/storage/v1/object/"
                f"{settings.supabase_storage_bucket_stickers}/{file_path}"
            )

            resp = await client.post(
                upload_url,
                headers={**_headers, "Content-Type": "image/png"},
                content=image_bytes,
            )
            resp.raise_for_status()

            # 3. 워터마크 썸네일 → fm-thumbnails 버킷에 업로드 (공개)
            try:
                thumb_bytes = create_watermarked_thumbnail(image_bytes)
                thumb_path = f"{user_id}/{generation_id}/{sort_order:02d}_{expression}_thumb.png"
                thumb_url = (
                    f"{settings.supabase_url}/storage/v1/object/"
                    f"fm-thumbnails/{thumb_path}"
                )
                await client.post(
                    thumb_url,
                    headers={**_headers, "Content-Type": "image/png"},
                    content=thumb_bytes,
                )
            except Exception as te:
                logger.warning(f"Failed to create thumbnail for {expression}: {te}")

            logger.info(f"Uploaded sticker: {file_path}")
            return file_path

    except Exception as e:
        logger.error(f"Failed to upload sticker {expression}: {e}")
        return None


async def insert_sticker_record(
    generation_id: str,
    sort_order: int,
    expression: str,
    image_path: str,
    thumbnail_path: str | None = None,
) -> None:
    """fm_stickers 테이블에 레코드 삽입."""
    try:
        body = {
            "generation_id": generation_id,
            "sort_order": sort_order,
            "expression": expression,
            "image_path": image_path,
        }
        if thumbnail_path:
            body["thumbnail_path"] = thumbnail_path

        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                f"{settings.supabase_url}/rest/v1/fm_stickers",
                headers={**_headers, "Content-Type": "application/json", "Prefer": "return=minimal"},
                json=body,
            )
            resp.raise_for_status()
    except Exception as e:
        logger.error(f"Failed to insert sticker record: {e}")


async def update_generation_status(
    generation_id: str,
    status: str,
    sticker_count: int | None = None,
) -> None:
    """fm_generations 상태 업데이트."""
    try:
        body: dict = {"status": status}
        if status == "completed":
            import datetime
            body["completed_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        if sticker_count is not None:
            body["sticker_count"] = sticker_count

        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.patch(
                f"{settings.supabase_url}/rest/v1/fm_generations?id=eq.{generation_id}",
                headers={**_headers, "Content-Type": "application/json", "Prefer": "return=minimal"},
                json=body,
            )
            resp.raise_for_status()
    except Exception as e:
        logger.error(f"Failed to update generation status: {e}")


async def delete_source_image(user_id: str, generation_id: str) -> None:
    """원본 셀카 삭제 (PIPA 준수)."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # uploads 버킷에서 해당 generation 폴더 삭제
            resp = await client.delete(
                f"{settings.supabase_url}/storage/v1/object/"
                f"{settings.supabase_storage_bucket_uploads}/{user_id}/{generation_id}",
                headers=_headers,
            )
            # source_image_path를 NULL로
            await client.patch(
                f"{settings.supabase_url}/rest/v1/fm_generations?id=eq.{generation_id}",
                headers={**_headers, "Content-Type": "application/json", "Prefer": "return=minimal"},
                json={"source_image_path": None},
            )
            logger.info(f"Deleted source image for generation {generation_id}")
    except Exception as e:
        logger.error(f"Failed to delete source image: {e}")
