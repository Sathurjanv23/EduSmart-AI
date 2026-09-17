"""Validated loading and inference for a trusted, locally trained artifact."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np
from sklearn.pipeline import Pipeline

from .constants import (
    ETHICAL_DISCLAIMER,
    FEATURE_NAMES,
    MODEL_SCHEMA_VERSION,
    RISK_LEVELS,
    SYNTHETIC_DATA_NOTICE,
)
from .schemas import PredictionInput


class ModelLoadError(RuntimeError):
    """Raised when the configured artifact is absent or violates the contract."""


class StudentRiskPredictor:
    def __init__(self, artifact_path: Path | str):
        self.artifact_path = Path(artifact_path)
        self.pipeline: Pipeline
        self.metadata: dict[str, Any]
        self._load()

    def _load(self) -> None:
        if not self.artifact_path.is_file():
            raise ModelLoadError(
                f"Model artifact not found at {self.artifact_path}. Run the offline "
                "training command before starting the service."
            )
        try:
            # Joblib uses pickle internally. Only artifacts created by this project's
            # trusted offline training command may be placed at MODEL_PATH.
            artifact = joblib.load(self.artifact_path)
        except Exception as exc:  # pragma: no cover - backend-specific joblib errors
            raise ModelLoadError(
                "The configured model artifact could not be loaded."
            ) from exc

        if not isinstance(artifact, dict):
            raise ModelLoadError("Model artifact must be a versioned dictionary bundle.")
        pipeline = artifact.get("pipeline")
        metadata = artifact.get("metadata")
        if not isinstance(pipeline, Pipeline) or not isinstance(metadata, dict):
            raise ModelLoadError("Model artifact is missing its pipeline or metadata.")
        required_metadata = {
            "model_version",
            "schema_version",
            "algorithm",
            "feature_names",
            "risk_levels",
            "training_data",
            "synthetic_samples",
            "random_seed",
            "metrics",
            "global_feature_importance",
            "data_notice",
        }
        missing_metadata = required_metadata.difference(metadata)
        if missing_metadata:
            raise ModelLoadError(
                "Model artifact metadata is incomplete: "
                + ", ".join(sorted(missing_metadata))
            )
        if metadata.get("schema_version") != MODEL_SCHEMA_VERSION:
            raise ModelLoadError("Model artifact schema version is incompatible.")
        if metadata.get("feature_names") != list(FEATURE_NAMES):
            raise ModelLoadError("Model feature contract does not match the service.")
        if metadata.get("risk_levels") != list(RISK_LEVELS):
            raise ModelLoadError("Model risk labels do not match the service.")
        if metadata.get("training_data") != "synthetic_demo":
            raise ModelLoadError("Model training-data provenance is missing or unsupported.")

        classifier = pipeline.named_steps.get("classifier")
        scaler = pipeline.named_steps.get("scaler")
        if classifier is None or scaler is None or not hasattr(classifier, "coef_"):
            raise ModelLoadError("Model pipeline cannot provide explainable predictions.")
        if set(classifier.classes_) != set(RISK_LEVELS):
            raise ModelLoadError("Trained classifier does not contain every risk class.")

        self.pipeline = pipeline
        self.metadata = metadata

    @property
    def model_version(self) -> str:
        return str(self.metadata["model_version"])

    def metrics_response(self) -> dict[str, Any]:
        return {
            "model_version": self.model_version,
            "algorithm": self.metadata["algorithm"],
            "training_data": "synthetic_demo",
            "synthetic_samples": self.metadata["synthetic_samples"],
            "random_seed": self.metadata["random_seed"],
            "metrics": self.metadata["metrics"],
            "global_feature_importance": self.metadata[
                "global_feature_importance"
            ],
            "data_notice": self.metadata["data_notice"],
        }

    def predict(self, features: PredictionInput) -> dict[str, Any]:
        input_values = features.model_dump()
        row = np.asarray(
            [[float(input_values[name]) for name in FEATURE_NAMES]], dtype=np.float64
        )
        predicted_label = str(self.pipeline.predict(row)[0])
        probability_values = self.pipeline.predict_proba(row)[0]
        classifier = self.pipeline.named_steps["classifier"]
        probability_by_class = {
            str(label): float(probability)
            for label, probability in zip(
                classifier.classes_, probability_values, strict=True
            )
        }
        probabilities = {
            label: probability_by_class[label] for label in RISK_LEVELS
        }

        class_index = list(classifier.classes_).index(predicted_label)
        scaled_values = self.pipeline.named_steps["scaler"].transform(row)[0]
        contribution_values = scaled_values * classifier.coef_[class_index]
        contributions = []
        for feature, original, contribution in zip(
            FEATURE_NAMES, row[0], contribution_values, strict=True
        ):
            numeric_contribution = float(contribution)
            if abs(numeric_contribution) < 1e-12:
                direction = "neutral"
            elif numeric_contribution > 0:
                direction = "supports_prediction"
            else:
                direction = "opposes_prediction"
            contributions.append(
                {
                    "feature": feature,
                    "value": float(original),
                    "contribution": numeric_contribution,
                    "direction": direction,
                }
            )
        contributions.sort(key=lambda item: abs(item["contribution"]), reverse=True)

        return {
            "risk_level": predicted_label,
            "confidence": probabilities[predicted_label],
            "probabilities": probabilities,
            "feature_contributions": contributions,
            "model_version": self.model_version,
            "training_data": "synthetic_demo",
            "data_notice": SYNTHETIC_DATA_NOTICE,
            "disclaimer": ETHICAL_DISCLAIMER,
        }
