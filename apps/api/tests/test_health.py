from httpx import ASGITransport, AsyncClient

from app.main import app


async def test_health_returns_200():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        res = await c.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
