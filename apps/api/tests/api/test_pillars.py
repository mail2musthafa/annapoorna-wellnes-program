"""Six Lifestyle Pillars API Tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_pillars_database_retrieval(client: AsyncClient, db_session: AsyncSession):
    # List pillars from seeded database
    res = await client.get("/api/v1/pillars")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 6
    assert any(p["slug"] == "nutrition" for p in data)

    # Detail pillar by slug
    detail_res = await client.get("/api/v1/pillars/nutrition")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["name"] == "Nutrition"
    assert "education_summary" in detail
