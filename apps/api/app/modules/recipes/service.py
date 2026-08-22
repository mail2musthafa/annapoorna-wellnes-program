"""Recipes Service and Data Retrieval."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundException
from app.core.pagination import PageParams, PageResponse
from app.modules.recipes.models import Recipe
from app.modules.recipes.schemas import RecipeDetail, RecipeIngredientSchema, RecipeListItem


class RecipeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_public_recipes(
        self,
        params: PageParams,
        tag: str | None = None,
        search: str | None = None,
    ) -> PageResponse[RecipeListItem]:
        query = select(Recipe).where(Recipe.is_public.is_(True), Recipe.is_deleted.is_(False))

        if search:
            query = query.where(Recipe.title.ilike(f"%{search}%"))

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar_one()

        # Paginated results
        paged_query = (
            query.order_by(Recipe.is_featured.desc(), Recipe.created_at.desc())
            .offset(params.offset)
            .limit(params.page_size)
        )
        result = await self.db.execute(paged_query)
        recipes = result.scalars().all()

        items = [
            RecipeListItem(
                id=str(r.id),
                title=r.title,
                slug=r.slug,
                summary=r.summary,
                prep_time_minutes=r.prep_time_minutes,
                cook_time_minutes=r.cook_time_minutes,
                servings=r.servings,
                difficulty=r.difficulty,
                image_url=r.image_url,
                is_featured=r.is_featured,
                tags=r.tags or [],
                calories=r.calories,
            )
            for r in recipes
        ]

        return PageResponse.create(items=items, total=total, params=params)

    async def get_recipe_by_slug(self, slug: str) -> RecipeDetail:
        query = (
            select(Recipe)
            .options(selectinload(Recipe.ingredients))
            .where(Recipe.slug == slug, Recipe.is_deleted.is_(False))
        )
        result = await self.db.execute(query)
        r = result.scalar_one_or_none()
        if not r:
            raise NotFoundException("Recipe", slug)

        return RecipeDetail(
            id=str(r.id),
            title=r.title,
            slug=r.slug,
            summary=r.summary,
            description=r.description,
            prep_time_minutes=r.prep_time_minutes,
            cook_time_minutes=r.cook_time_minutes,
            servings=r.servings,
            difficulty=r.difficulty,
            image_url=r.image_url,
            video_url=r.video_url,
            is_featured=r.is_featured,
            is_public=r.is_public,
            calories=r.calories,
            protein_grams=float(r.protein_grams) if r.protein_grams is not None else None,
            carbs_grams=float(r.carbs_grams) if r.carbs_grams is not None else None,
            fat_grams=float(r.fat_grams) if r.fat_grams is not None else None,
            fiber_grams=float(r.fiber_grams) if r.fiber_grams is not None else None,
            instructions=r.instructions or [],
            tags=r.tags or [],
            ingredients=[
                RecipeIngredientSchema(
                    id=str(ing.id),
                    ingredient_name=ing.ingredient_name,
                    quantity=ing.quantity,
                    notes=ing.notes,
                    display_order=ing.display_order,
                )
                for ing in r.ingredients
            ],
        )
