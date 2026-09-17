from __future__ import annotations

from pathlib import Path

import pytest

from app.training import train_model


@pytest.fixture(scope="session")
def trained_artifact(tmp_path_factory: pytest.TempPathFactory) -> tuple[Path, dict]:
    output_directory = tmp_path_factory.mktemp("student-risk-model")
    artifact_path = output_directory / "model.joblib"
    metadata = train_model(
        artifact_path,
        output_directory / "metrics.json",
        samples=600,
        seed=42,
    )
    return artifact_path, metadata


@pytest.fixture()
def valid_payload() -> dict:
    return {
        "attendance_percentage": 91.0,
        "average_marks": 78.0,
        "assignment_completion_rate": 95.0,
        "recent_grade_trend": 4.0,
        "missed_assignments": 0,
    }
