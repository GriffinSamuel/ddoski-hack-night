from fastapi import APIRouter

from app.config import get_settings

router = APIRouter(prefix="/api/v1", tags=["health"])


@router.get("/health", operation_id="getHealth")
async def getHealth() -> dict:
    s = get_settings()
    return {
        "status": "ok",
        "supabase_configured": bool(s.supabase_url and s.supabase_service_role_key),
        "anthropic_configured": bool(s.anthropic_api_key),
    }
