import time

from fastapi import APIRouter

router = APIRouter()
_start_time = time.time()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "version": "0.1.0",
        "uptime": round(time.time() - _start_time),
    }
