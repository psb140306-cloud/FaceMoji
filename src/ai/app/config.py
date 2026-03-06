from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    app_port: int = 8000
    api_key: str = ""

    # fal.ai (MVP)
    fal_key: str = ""
    fal_model: str = "fal-ai/face-to-sticker"

    # RunPod (v1.5+)
    runpod_api_key: str = ""
    runpod_endpoint_id: str = ""

    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_storage_bucket_uploads: str = "fm-uploads"
    supabase_storage_bucket_stickers: str = "fm-stickers"
    supabase_storage_bucket_packages: str = "fm-ogq-packages"

    # AI Parameters
    default_instant_id_strength: float = 0.7
    default_ip_adapter_weight: float = 0.2
    max_concurrent_generations: int = 10
    generation_timeout_seconds: int = 300

    # Logging
    log_level: str = "INFO"
    sentry_dsn: str = ""

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
