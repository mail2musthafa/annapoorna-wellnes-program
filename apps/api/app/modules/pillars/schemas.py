"""Pillars Schemas."""

from pydantic import BaseModel


class MetricDefinitionResponse(BaseModel):
    id: str
    name: str
    code: str
    unit: str
    data_type: str
    description: str | None = None


class PillarGoalResponse(BaseModel):
    id: str
    title: str
    description: str
    suggested_frequency: str


class PillarResponse(BaseModel):
    id: str
    name: str
    slug: str
    tagline: str
    description: str
    icon_name: str
    display_order: int
    education_summary: str
    management_summary: str
    analysis_summary: str
    goals: list[PillarGoalResponse] = []
    metrics: list[MetricDefinitionResponse] = []
