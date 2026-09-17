"""FastAPI entry point for student performance risk inference."""

from __future__ import annotations

import logging
import math
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, AsyncIterator

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from . import __version__
from .predictor import ModelLoadError, StudentRiskPredictor
from .schemas import (
    BatchPredictionInput,
    BatchPredictionResponse,
    HealthResponse,
    ModelMetricsResponse,
    PredictionInput,
    PredictionResponse,
    ServiceInfo,
)
from .settings import get_settings


logger = logging.getLogger("student_risk_ml")


def _json_safe(value: Any) -> Any:
    """Make validation details standards-compliant without echoing unsafe values."""
    if isinstance(value, float) and not math.isfinite(value):
        return "non-finite number"
    if isinstance(value, dict):
        return {str(key): _json_safe(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_safe(item) for item in value]
    return value


def create_app(model_path: Path | str | None = None) -> FastAPI:
    settings = get_settings(model_path)
    logging.basicConfig(
        level=getattr(logging, settings.log_level, logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        application.state.predictor = None
        application.state.model_error = None
        try:
            application.state.predictor = StudentRiskPredictor(settings.model_path)
            logger.info(
                "Loaded student-risk model version=%s",
                application.state.predictor.model_version,
            )
        except ModelLoadError as exc:
            application.state.model_error = str(exc)
            # Paths and model errors belong in server logs, not public API responses.
            logger.error("Student-risk model unavailable: %s", exc)
        yield
        application.state.predictor = None

    application = FastAPI(
        title="Student Performance Risk Predictor",
        summary="Explainable academic risk decision support",
        description=(
            "Predicts LOW, MEDIUM, or HIGH academic risk from aggregate indicators. "
            "The bundled demonstration model is trained only on synthetic data and "
            "must not drive automated punitive decisions. Access is intended to be "
            "proxied through the authenticated Spring Boot API."
        ),
        version=__version__,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    @application.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": _json_safe(exc.errors())},
        )

    def require_predictor(request: Request) -> StudentRiskPredictor:
        predictor = getattr(request.app.state, "predictor", None)
        if predictor is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The prediction model is unavailable.",
            )
        return predictor

    @application.get("/", response_model=ServiceInfo, include_in_schema=False)
    def service_info() -> ServiceInfo:
        return ServiceInfo(version=__version__)

    @application.get("/health", response_model=HealthResponse)
    def health(request: Request, response: Response) -> HealthResponse:
        predictor = getattr(request.app.state, "predictor", None)
        if predictor is None:
            response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
            return HealthResponse(
                status="unavailable",
                model_loaded=False,
                model_version=None,
                synthetic_training_data=None,
            )
        return HealthResponse(
            status="healthy",
            model_loaded=True,
            model_version=predictor.model_version,
            synthetic_training_data=True,
        )

    @application.get("/metrics", response_model=ModelMetricsResponse)
    def model_metrics(request: Request) -> dict:
        return require_predictor(request).metrics_response()

    @application.post("/predict", response_model=PredictionResponse)
    def predict(features: PredictionInput, request: Request) -> dict:
        return require_predictor(request).predict(features)

    @application.post("/predict/batch", response_model=BatchPredictionResponse)
    def predict_batch(payload: BatchPredictionInput, request: Request) -> dict:
        predictor = require_predictor(request)
        return {
            "predictions": [
                predictor.predict(student_features)
                for student_features in payload.students
            ]
        }

    return application


app = create_app()
