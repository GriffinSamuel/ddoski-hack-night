from fastapi import APIRouter, HTTPException, Request

from app.errors import error_body
from app.schemas import ErrorEnvelope, RoastLinesResponse, RoastReplacementResponse, RoastRequest
from app.services import ollama

router = APIRouter(prefix="/api/v1", tags=["Roast"])


@router.post(
    "/roast",
    operation_id="createRoast",
    response_model=RoastLinesResponse | RoastReplacementResponse,
    responses={code: {"model": ErrorEnvelope} for code in (500, 502, 503, 504)},
)
async def createRoast(body: RoastRequest, request: Request):
    if not getattr(request.app.state, "ai_ready", False):
        # Warm-up failed (or never ran): quick re-check, then fail fast.
        if not await ollama.is_available():
            raise HTTPException(503, detail=error_body("ai_unavailable", "AI provider unavailable"))
        request.app.state.ai_ready = True
    try:
        return await ollama.generate_roast(body.code, body.file_name, body.emotion, body.avatar, body.mode)
    except ollama.AiUnavailableError:
        request.app.state.ai_ready = False
        raise HTTPException(503, detail=error_body("ai_unavailable", "AI provider unavailable")) from None
    except ollama.AiTimeoutError:
        raise HTTPException(504, detail=error_body("ai_timeout", "AI request timed out")) from None
    except ollama.AiGenerationError:
        raise HTTPException(502, detail=error_body("ai_error", "AI request failed")) from None
