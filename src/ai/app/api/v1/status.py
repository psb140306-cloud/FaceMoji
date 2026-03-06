from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import verify_api_key
from app.services.job_queue import job_queue

router = APIRouter()


@router.get("/status/{job_id}")
async def get_job_status(
    job_id: str,
    _api_key: str = Depends(verify_api_key),
):
    status = job_queue.get_job_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    return status
