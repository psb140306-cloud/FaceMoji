"""워터마크 미리보기 생성 모듈."""

import io
import logging

from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)

THUMBNAIL_SIZE = (360, 310)
WATERMARK_TEXT = "FaceMoji"
WATERMARK_OPACITY = 80  # 0-255


def create_watermarked_thumbnail(image_bytes: bytes) -> bytes:
    """원본 이미지에 워터마크를 추가한 저해상도 썸네일 생성."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")

    # 리사이즈
    img.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)

    # 워터마크 레이어 생성
    watermark = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(watermark)

    # 폰트 설정 (시스템 기본 폰트 사용)
    font_size = max(img.width // 8, 20)
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except (OSError, IOError):
        font = ImageFont.load_default()

    # 대각선 워터마크 반복
    text_bbox = draw.textbbox((0, 0), WATERMARK_TEXT, font=font)
    text_w = text_bbox[2] - text_bbox[0]
    text_h = text_bbox[3] - text_bbox[1]

    for y in range(-img.height, img.height * 2, text_h * 3):
        for x in range(-img.width, img.width * 2, text_w + 40):
            draw.text(
                (x, y),
                WATERMARK_TEXT,
                fill=(255, 255, 255, WATERMARK_OPACITY),
                font=font,
            )

    # 워터마크 레이어를 45도 회전
    watermark = watermark.rotate(
        -30,
        resample=Image.BICUBIC,
        expand=True,
        center=(img.width // 2, img.height // 2),
    )

    # 원본 크기로 자르기
    crop_x = (watermark.width - img.width) // 2
    crop_y = (watermark.height - img.height) // 2
    watermark = watermark.crop((crop_x, crop_y, crop_x + img.width, crop_y + img.height))

    # 합성
    result = Image.alpha_composite(img, watermark)

    buf = io.BytesIO()
    result.save(buf, format="PNG", optimize=True)
    return buf.getvalue()
