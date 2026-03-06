from pydantic import BaseModel

from app.models.enums import ExpressionType, StyleType


class GenerateRequest(BaseModel):
    image_url: str
    style: StyleType
    user_id: str | None = None
    generation_id: str | None = None
    expressions: list[ExpressionType] | None = None
    callback_url: str | None = None


class GenerateResponse(BaseModel):
    job_id: str
    estimated_time: int
