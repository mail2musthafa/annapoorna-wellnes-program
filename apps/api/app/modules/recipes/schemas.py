"""Recipes Schemas."""

from pydantic import BaseModel


class RecipeIngredientSchema(BaseModel):
    id: str | None = None
    ingredient_name: str
    quantity: str
    notes: str | None = None
    display_order: int = 1


class RecipeListItem(BaseModel):
    id: str
    title: str
    slug: str
    summary: str
    prep_time_minutes: int
    cook_time_minutes: int
    servings: int
    difficulty: str
    image_url: str | None = None
    is_featured: bool
    tags: list[str] = []
    calories: int | None = None


class RecipeDetail(BaseModel):
    id: str
    title: str
    slug: str
    summary: str
    description: str | None = None
    prep_time_minutes: int
    cook_time_minutes: int
    servings: int
    difficulty: str
    image_url: str | None = None
    video_url: str | None = None
    is_featured: bool
    is_public: bool
    calories: int | None = None
    protein_grams: float | None = None
    carbs_grams: float | None = None
    fat_grams: float | None = None
    fiber_grams: float | None = None
    instructions: list[str] = []
    tags: list[str] = []
    ingredients: list[RecipeIngredientSchema] = []
