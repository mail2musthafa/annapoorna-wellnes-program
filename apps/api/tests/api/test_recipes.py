"""Recipes API Tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_recipes_public_listing_and_detail(client: AsyncClient, db_session: AsyncSession):
    # Public list
    list_res = await client.get("/api/v1/recipes")
    assert list_res.status_code == 200
    data = list_res.json()
    assert data["total"] >= 12

    # Detail view
    detail_res = await client.get("/api/v1/recipes/ayurvedic-golden-kitchari")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["title"] == "Ayurvedic Golden Kitchari"
    assert len(detail["ingredients"]) > 0
    assert detail["ingredients"][0]["ingredient_name"] is not None
