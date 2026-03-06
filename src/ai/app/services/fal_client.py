import os
import logging

import fal_client

from app.config import settings
from app.models.enums import StyleType

logger = logging.getLogger(__name__)

# 스타일별 프롬프트 프리셋
STYLE_PROMPTS: dict[str, dict[str, str]] = {
    StyleType.CARTOON: {
        "suffix": "cartoon sticker style, bold outlines, vibrant colors, cute chibi proportions",
        "negative": "realistic, photographic, 3d render, dark, scary",
    },
    StyleType.FLAT: {
        "suffix": "flat design sticker, minimal shading, clean vector style, simple shapes",
        "negative": "realistic, photographic, 3d, detailed shading, gradient",
    },
    StyleType.ANIME: {
        "suffix": "anime sticker style, big eyes, manga illustration, kawaii",
        "negative": "realistic, western cartoon, 3d render",
    },
    StyleType.WATERCOLOR: {
        "suffix": "watercolor painting sticker, soft edges, pastel colors, artistic brush strokes",
        "negative": "realistic, photographic, sharp lines, digital art",
    },
    StyleType.THREE_D: {
        "suffix": "3d rendered sticker, pixar style, smooth plastic texture, cute character",
        "negative": "2d, flat, sketch, photographic, realistic",
    },
    StyleType.MANGA: {
        "suffix": "manga sticker style, black and white with accents, expressive, japanese comic",
        "negative": "realistic, photographic, western cartoon, 3d",
    },
}

# 표정별 프롬프트
EXPRESSION_PROMPTS: dict[str, str] = {
    "smile": "happy smiling face, joyful expression",
    "heart": "heart eyes, love expression, hearts around",
    "cry": "crying face, tears falling, sad expression",
    "angry": "angry face, furious expression, red face",
    "surprise": "surprised face, shocked expression, wide open mouth",
    "sigh": "exhausted face, sighing, tired expression",
    "wow": "amazed face, starry eyes, excited expression",
    "huh": "deadpan face, unimpressed, blank expression",
    "sleepy": "sleepy face, zzz, drowsy eyes, sleeping",
    "fighting": "determined face, fist pump, fighting spirit",
    "thanks": "grateful face, praying hands, thankful expression",
    "sorry": "apologetic face, bowing, sorry expression",
    "ok": "thumbs up, okay sign, approving expression",
    "no": "rejecting face, waving hands no, disapproving",
    "thinking": "thinking face, hand on chin, contemplating",
    "cake": "birthday celebration, party hat, cake, happy",
    "excited": "super excited face, jumping with joy, celebration",
    "panic": "panicking face, mind blown, explosive shock",
    "cheer_up": "encouraging face, flexing arm, motivating",
    "drowsy": "yawning face, very sleepy, half-closed eyes",
    "shy": "blushing face, covering face, embarrassed",
    "hungry": "drooling face, hungry expression, looking at food",
    "cold": "freezing face, shivering, blue from cold",
    "happy": "beaming happy face, radiating joy, hugging",
}


def _init_fal():
    """fal_client 환경변수 초기화."""
    os.environ["FAL_KEY"] = settings.fal_key


async def generate_single_sticker(
    image_url: str,
    expression: str,
    style: StyleType,
    instant_id_strength: float | None = None,
    ip_adapter_weight: float | None = None,
) -> dict:
    """fal.ai face-to-sticker API로 단일 스티커 생성."""
    _init_fal()

    style_config = STYLE_PROMPTS.get(style, STYLE_PROMPTS[StyleType.CARTOON])
    expr_prompt = EXPRESSION_PROMPTS.get(expression, "neutral expression")

    prompt = f"sticker of a person with {expr_prompt}, {style_config['suffix']}, transparent background, high quality"
    negative_prompt = f"{style_config['negative']}, blurry, low quality, watermark, text"

    arguments = {
        "image_url": image_url,
        "prompt": prompt,
        "negative_prompt": negative_prompt,
        "instant_id_strength": instant_id_strength or settings.default_instant_id_strength,
        "ip_adapter_weight": ip_adapter_weight or settings.default_ip_adapter_weight,
    }

    logger.info(f"Generating sticker: expression={expression}, style={style}")

    result = await fal_client.subscribe_async(
        settings.fal_model,
        arguments=arguments,
    )

    return result
