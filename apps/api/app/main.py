# Starter skeleton written to fastapi-developer's conventions (create_app, lifespan, error envelope, /api/v1).
# fastapi-developer extends this: add one router per resource and register it in create_app().
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.errors import error_body
from app.routers import health, roast
from app.services import ollama

log = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm the model once so no demo request pays the cold load. Failure must not stop the app.
    app.state.ai_ready = await ollama.warm_up()
    if not app.state.ai_ready:
        log.warning("AI provider not ready at startup; /api/v1/roast will re-check per request")
    yield


def create_app() -> FastAPI:
    s = get_settings()
    app = FastAPI(title="Hackathon API", version="1.0.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=s.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(HTTPException)
    async def http_exc(_: Request, exc: HTTPException):
        detail = exc.detail if isinstance(exc.detail, dict) and "error" in exc.detail else error_body("bad_request" if exc.status_code == 400 else "not_found" if exc.status_code == 404 else "internal_error", str(exc.detail))
        return JSONResponse(status_code=exc.status_code, content=detail, headers=exc.headers)

    @app.exception_handler(RequestValidationError)
    async def validation_exc(_: Request, exc: RequestValidationError):
        return JSONResponse(status_code=422, content=error_body("validation_error", "; ".join(f"{'.'.join(str(p) for p in e['loc'])}: {e['msg']}" for e in exc.errors())))

    app.include_router(health.router)
    app.include_router(roast.router)
    return app


app = create_app()
