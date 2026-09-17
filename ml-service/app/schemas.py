"""Validated HTTP request and response contracts."""

from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field


RiskLevel = Literal["LOW", "MEDIUM", "HIGH"]


class PredictionInput(BaseModel):
    """Aggregate academic indicators; no direct identifiers are accepted."""

    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)

    attendance_percentage: Annotated[
        float,
        Field(ge=0, le=100, description="Attendance during the evaluation period."),
    ]
    average_marks: Annotated[
        float,
        Field(ge=0, le=100, description="Average normalized mark for the period."),
    ]
    assignment_completion_rate: Annotated[
        float,
        Field(ge=0, le=100, description="Percentage of due assignments completed."),
    ]
    recent_grade_trend: Annotated[
        float,
        Field(
            ge=-100,
            le=100,
            description="Recent minus earlier average marks, in percentage points.",
        ),
    ]
    missed_assignments: Annotated[
        int,
        Field(
            ge=0,
            le=50,
            strict=True,
            description="Count of due assignments not submitted in the period.",
        ),
    ]


class RiskProbabilities(BaseModel):
    LOW: Annotated[float, Field(ge=0, le=1)]
    MEDIUM: Annotated[float, Field(ge=0, le=1)]
    HIGH: Annotated[float, Field(ge=0, le=1)]


class FeatureContribution(BaseModel):
    feature: str
    value: float
    contribution: float
    direction: Literal["supports_prediction", "opposes_prediction", "neutral"]


class PredictionResponse(BaseModel):
    risk_level: RiskLevel
    confidence: Annotated[float, Field(ge=0, le=1)]
    probabilities: RiskProbabilities
    feature_contributions: list[FeatureContribution]
    model_version: str
    training_data: Literal["synthetic_demo"]
    data_notice: str
    disclaimer: str


class BatchPredictionInput(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)

    students: Annotated[list[PredictionInput], Field(min_length=1, max_length=100)]


class BatchPredictionResponse(BaseModel):
    predictions: list[PredictionResponse]


class HealthResponse(BaseModel):
    status: Literal["healthy", "unavailable"]
    service: Literal["student-risk-ml"] = "student-risk-ml"
    model_loaded: bool
    model_version: str | None
    synthetic_training_data: bool | None


class PerClassMetrics(BaseModel):
    precision: Annotated[float, Field(ge=0, le=1)]
    recall: Annotated[float, Field(ge=0, le=1)]
    f1: Annotated[float, Field(ge=0, le=1)]
    support: int


class TrainingMetrics(BaseModel):
    accuracy: Annotated[float, Field(ge=0, le=1)]
    precision_macro: Annotated[float, Field(ge=0, le=1)]
    recall_macro: Annotated[float, Field(ge=0, le=1)]
    f1_macro: Annotated[float, Field(ge=0, le=1)]
    confusion_matrix: list[list[int]]
    labels: list[RiskLevel]
    per_class: dict[RiskLevel, PerClassMetrics]
    test_samples: int


class ModelMetricsResponse(BaseModel):
    model_version: str
    algorithm: str
    training_data: Literal["synthetic_demo"]
    synthetic_samples: int
    random_seed: int
    metrics: TrainingMetrics
    global_feature_importance: dict[str, Annotated[float, Field(ge=0, le=1)]]
    data_notice: str


class ServiceInfo(BaseModel):
    service: Literal["student-risk-ml"] = "student-risk-ml"
    version: str
    documentation: str = "/docs"
    health: str = "/health"
