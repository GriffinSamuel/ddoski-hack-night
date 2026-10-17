from fastapi import APIRouter, Request

from app.config import get_settings

router = APIRouter(prefix="/api/v1", tags=["health"])


@router.get("/health", operation_id="getHealth")
async def getHealth(request: Request) -> dict:
    s = get_settings()
    return {
        "status": "ok",
        "supabase_configured": bool(s.supabase_url and s.supabase_service_role_key),
        "anthropic_configured": bool(s.anthropic_api_key),
        "ai_configured": getattr(request.app.state, "ai_ready", None),
    }
