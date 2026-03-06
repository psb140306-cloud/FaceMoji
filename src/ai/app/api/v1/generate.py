import asyncio
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends

from app.api.deps import verify_api_key
from app.config import settings
from app.models.enums import StyleType
from app.models.schemas import GenerateRequest, GenerateResponse
from app.services.job_queue import Job, job_queue

router = APIRouter()

# 기본 24개 표정 목록
DEFAULT_EXPRESSIONS = [
    "smile", "heart", "cry", "angry", "surprise", "sigh",
    "wow", "huh", "sleepy", "fighting", "thanks", "sorry",
    "ok", "no", "thinking", "cake", "excited", "panic",
    "cheer_up", "drowsy", "shy", "hungry", "cold", "happy",
]


@router.post("/generate", response_model=GenerateResponse)
async def generate_sticker_set(
    request: GenerateRequest,
    background_tasks: BackgroundTasks,
    _api_key: str = Depends(verify_api_key),
):
    job_id = str(uuid.uuid4())

    expressions = (
        [e.value for e in request.expressions]
        if request.expressions
        else DEFAULT_EXPRESSIONS
    )

    job = Job(
        job_id=job_id,
        user_id=request.user_id or "",
        generation_id=request.generation_id or job_id,
        image_url=request.image_url,
        style=request.style,
        expressions=expressions,
    )

    job_queue.add_job(job)
    background_tasks.add_task(job_queue.process_job, job)

    return GenerateResponse(
        job_id=job_id,
        estimated_time=len(expressions) * 5,
    )
