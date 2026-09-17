from __future__ import annotations

import json

import numpy as np

from app.predictor import StudentRiskPredictor
from app.schemas import PredictionInput
from app.training import generate_synthetic_data, train_model


def test_synthetic_generator_is_reproducible() -> None:
    first_features, first_labels, first_thresholds = generate_synthetic_data(400, 7)
    second_features, second_labels, second_thresholds = generate_synthetic_data(400, 7)

    np.testing.assert_array_equal(first_features, second_features)
    np.testing.assert_array_equal(first_labels, second_labels)
    assert first_thresholds == second_thresholds
    assert set(first_labels) == {"LOW", "MEDIUM", "HIGH"}


def test_training_persists_model_and_calculated_metrics(tmp_path) -> None:
    artifact_path = tmp_path / "risk.joblib"
    metrics_path = tmp_path / "metrics.json"
    metadata = train_model(
        artifact_path, metrics_path, samples=500, seed=19
    )

    assert artifact_path.is_file()
    assert metrics_path.is_file()
    assert json.loads(metrics_path.read_text(encoding="utf-8")) == metadata
    metrics = metadata["metrics"]
    for name in ("accuracy", "precision_macro", "recall_macro", "f1_macro"):
        assert 0 <= metrics[name] <= 1
    assert sum(sum(row) for row in metrics["confusion_matrix"]) == 100

    result = StudentRiskPredictor(artifact_path).predict(
        PredictionInput(
            attendance_percentage=55,
            average_marks=42,
            assignment_completion_rate=50,
            recent_grade_trend=-8,
            missed_assignments=5,
        )
    )
    assert result["risk_level"] in {"LOW", "MEDIUM", "HIGH"}
    assert result["model_version"] == metadata["model_version"]
