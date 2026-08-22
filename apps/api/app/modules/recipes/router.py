"""Recipes API Router."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.pagination import PageParams, PageResponse
from app.db.session import get_db
from app.modules.recipes.schemas import RecipeDetail, RecipeListItem
from app.modules.recipes.service import RecipeService

router = APIRouter(prefix="/recipes", tags=["Recipes & Nutrition"])


@router.get(
    "",
    response_model=PageResponse[RecipeListItem],
    summary="List public recipes with pagination and optional search",
)
async def list_recipes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    tag: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = RecipeService(db)
    params = PageParams(page=page, page_size=page_size)
    return await service.list_public_recipes(params=params, tag=tag, search=search)


@router.get(
    "/{slug}",
    response_model=RecipeDetail,
    summary="Get full recipe details including structured ingredients and method",
)
async def get_recipe(slug: str, db: AsyncSession = Depends(get_db)):
    service = RecipeService(db)
    return await service.get_recipe_by_slug(slug)
