import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.deps import verify_api_key
from app.config import settings
from app.services.ogq_converter import create_ogq_zip
from app.services.supabase_client import _headers

router = APIRouter()


class ResizeRequest(BaseModel):
    generation_id: str
    user_id: str


@router.post("/resize")
async def resize_for_ogq(
    request: ResizeRequest,
    _api_key: str = Depends(verify_api_key),
):
    """생성 완료된 스티커를 OGQ 규격으로 변환 → ZIP 패키지 생성 → Storage 업로드."""
    try:
        # 1. DB에서 해당 generation의 sticker 목록 조회
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"{settings.supabase_url}/rest/v1/fm_stickers"
                f"?generation_id=eq.{request.generation_id}&order=sort_order.asc",
                headers={**_headers, "Content-Type": "application/json"},
            )
            resp.raise_for_status()
            stickers = resp.json()

        if not stickers:
            raise HTTPException(status_code=404, detail="No stickers found")

        # 2. Storage에서 각 스티커 이미지 다운로드
        sticker_images: list[tuple[str, bytes]] = []
        async with httpx.AsyncClient(timeout=60) as client:
            for s in stickers:
                img_resp = await client.get(
                    f"{settings.supabase_url}/storage/v1/object/authenticated/"
                    f"{settings.supabase_storage_bucket_stickers}/{s['image_path']}",
                    headers=_headers,
                )
                img_resp.raise_for_status()
                sticker_images.append((s["expression"], img_resp.content))

        # 3. OGQ ZIP 생성
        zip_bytes = create_ogq_zip(sticker_images)

        # 4. ZIP을 Storage에 업로드
        zip_path = f"{request.user_id}/{request.generation_id}/package.zip"
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{settings.supabase_url}/storage/v1/object/"
                f"{settings.supabase_storage_bucket_packages}/{zip_path}",
                headers={**_headers, "Content-Type": "application/zip"},
                content=zip_bytes,
            )
            resp.raise_for_status()

        # 5. DB에 ogq_image_path 업데이트
        # (각 스티커의 OGQ 경로는 ZIP 내부에 있으므로 ZIP 경로만 기록)

        return {
            "zip_path": zip_path,
            "sticker_count": len(sticker_images),
            "zip_size_bytes": len(zip_bytes),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OGQ conversion failed: {str(e)}")
