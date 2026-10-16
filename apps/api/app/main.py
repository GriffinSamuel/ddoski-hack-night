# Starter skeleton written to fastapi-developer's conventions (create_app, lifespan, error envelope, /api/v1).
# fastapi-developer extends this: add one router per resource and register it in create_app().
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from anthropic import AsyncAnthropic
from supabase import create_client

from app.config import get_settings
from app.routers import health


@asynccontextmanager
async def lifespan(app: FastAPI):
    s = get_settings()
    app.state.anthropic = AsyncAnthropic(api_key=s.anthropic_api_key or None)
    app.state.supabase = (
        create_client(s.supabase_url, s.supabase_service_role_key)
        if s.supabase_url and s.supabase_service_role_key
        else None
    )
    yield


def error_body(code: str, message: str) -> dict:
    return {"error": {"code": code, "message": message}}


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
    return app


app = create_app()
