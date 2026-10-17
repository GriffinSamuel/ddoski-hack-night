def error_body(code: str, message: str) -> dict:
    """Error envelope shared by main.py and the routers (kept here to avoid a circular import)."""
    return {"error": {"code": code, "message": message}}
