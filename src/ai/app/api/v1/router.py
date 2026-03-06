from fastapi import APIRouter

from app.api.v1 import generate, health, resize, status

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(generate.router, tags=["generate"])
api_router.include_router(status.router, tags=["status"])
api_router.include_router(resize.router, tags=["resize"])
