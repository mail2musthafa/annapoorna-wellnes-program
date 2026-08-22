"""Recipes, Ingredients, and Dietary Tags Database Models."""

import uuid

from sqlalchemy import JSON, Boolean, ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class DietaryTag(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "dietary_tags"

    name: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(200), nullable=True)


class RecipeCategory(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "recipe_categories"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class Recipe(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "recipes"

    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    prep_time_minutes: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    cook_time_minutes: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    servings: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(30), default="Easy", nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    
    # Nutrition information per serving
    calories: Mapped[int | None] = mapped_column(Integer, nullable=True)
    protein_grams: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)
    carbs_grams: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)
    fat_grams: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)
    fiber_grams: Mapped[float | None] = mapped_column(Numeric(6, 2), nullable=True)

    # Structured steps & tags
    instructions: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)

    category_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("recipe_categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    ingredients: Mapped[list["RecipeIngredient"]] = relationship(
        "RecipeIngredient",
        back_populates="recipe",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class Ingredient(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "ingredients"

    name: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_common_allergen: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class RecipeIngredient(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "recipe_ingredients"

    recipe_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("recipes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ingredient_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("ingredients.id", ondelete="SET NULL"),
        nullable=True,
    )
    ingredient_name: Mapped[str] = mapped_column(String(150), nullable=False)
    quantity: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[str | None] = mapped_column(String(200), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    recipe: Mapped["Recipe"] = relationship("Recipe", back_populates="ingredients")
