"""OGQ 규격 변환 모듈.

OGQ 스티커 규격:
- 스티커: 24개, 740x640px, 투명 배경 PNG
- 메인: 240x240px
- 탭: 96x74px
- 72dpi 이상, RGB+Alpha, 각 1MB 이하
"""

import io
import logging
import zipfile

from PIL import Image

logger = logging.getLogger(__name__)

OGQ_STICKER_SIZE = (740, 640)
OGQ_MAIN_SIZE = (240, 240)
OGQ_TAB_SIZE = (96, 74)
BORDER_WIDTH = 3
BORDER_COLOR = (255, 255, 255, 255)  # 흰색
MAX_FILE_SIZE = 1024 * 1024  # 1MB


def resize_to_ogq(image_bytes: bytes, target_size: tuple[int, int]) -> bytes:
    """이미지를 OGQ 규격 크기로 리사이즈. 투명 배경 유지, 비율 맞춤."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")

    # 대상 크기에 맞추되 비율 유지, 남는 부분은 투명
    target_w, target_h = target_size
    img.thumbnail((target_w - BORDER_WIDTH * 2, target_h - BORDER_WIDTH * 2), Image.LANCZOS)

    # 투명 캔버스 생성
    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))

    # 중앙 배치
    offset_x = (target_w - img.width) // 2
    offset_y = (target_h - img.height) // 2
    canvas.paste(img, (offset_x, offset_y), img)

    return _to_png_bytes(canvas)


def add_white_border(image_bytes: bytes) -> bytes:
    """3px 흰색 테두리 추가 (다크모드 대응)."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")

    # 알파 채널로 마스크 생성 후 외곽에 흰색 테두리
    alpha = img.split()[3]

    # 흰색 테두리용 확장 이미지
    bordered = Image.new("RGBA", img.size, (0, 0, 0, 0))

    # 상하좌우 BORDER_WIDTH 픽셀씩 흰색으로 그리기
    for dx in range(-BORDER_WIDTH, BORDER_WIDTH + 1):
        for dy in range(-BORDER_WIDTH, BORDER_WIDTH + 1):
            if dx * dx + dy * dy <= BORDER_WIDTH * BORDER_WIDTH:
                shifted = Image.new("RGBA", img.size, BORDER_COLOR)
                mask = alpha.copy()
                bordered.paste(shifted, (dx, dy), mask)

    # 원본을 위에 합성
    bordered.paste(img, (0, 0), img)

    return _to_png_bytes(bordered)


def validate_transparent_background(image_bytes: bytes) -> bool:
    """투명 배경인지 검증."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    alpha = img.split()[3]
    # 코너 4곳의 알파값 확인
    corners = [
        alpha.getpixel((0, 0)),
        alpha.getpixel((img.width - 1, 0)),
        alpha.getpixel((0, img.height - 1)),
        alpha.getpixel((img.width - 1, img.height - 1)),
    ]
    return all(c < 10 for c in corners)


def create_main_image(sticker_bytes: bytes) -> bytes:
    """메인 이미지 (240x240) 생성. 첫 번째 스티커를 리사이즈."""
    return resize_to_ogq(sticker_bytes, OGQ_MAIN_SIZE)


def create_tab_image(sticker_bytes: bytes) -> bytes:
    """탭 이미지 (96x74) 생성."""
    return resize_to_ogq(sticker_bytes, OGQ_TAB_SIZE)


def optimize_png(image_bytes: bytes) -> bytes:
    """PNG 최적화 (1MB 이하로)."""
    if len(image_bytes) <= MAX_FILE_SIZE:
        return image_bytes

    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")

    # 점진적 품질 낮추기
    for quality_reduction in [0, 10, 20, 30]:
        buf = io.BytesIO()
        if quality_reduction > 0:
            # 약간 축소 후 다시 원래 크기로
            w, h = img.size
            scale = 1 - quality_reduction / 100
            small = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
            resized = small.resize((w, h), Image.LANCZOS)
            resized.save(buf, format="PNG", optimize=True)
        else:
            img.save(buf, format="PNG", optimize=True)

        if buf.tell() <= MAX_FILE_SIZE:
            return buf.getvalue()

    # 최후 수단: 그냥 반환
    return image_bytes


def create_ogq_zip(
    sticker_images: list[tuple[str, bytes]],
) -> bytes:
    """OGQ 제출용 ZIP 패키지 생성.

    Args:
        sticker_images: [(expression, image_bytes), ...] 24개
    Returns:
        ZIP 파일 bytes
    """
    buf = io.BytesIO()

    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for i, (expression, img_bytes) in enumerate(sticker_images):
            # 스티커 이미지 (740x640)
            ogq_bytes = resize_to_ogq(img_bytes, OGQ_STICKER_SIZE)
            ogq_bytes = add_white_border(ogq_bytes)
            ogq_bytes = optimize_png(ogq_bytes)
            zf.writestr(f"stickers/{i + 1:02d}_{expression}.png", ogq_bytes)

        # 메인 이미지 (첫 번째 스티커 기반)
        if sticker_images:
            main_bytes = create_main_image(sticker_images[0][1])
            zf.writestr("main.png", main_bytes)

            tab_bytes = create_tab_image(sticker_images[0][1])
            zf.writestr("tab.png", tab_bytes)

    return buf.getvalue()


def _to_png_bytes(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()
