from __future__ import annotations

import math

import joblib
from fastapi.testclient import TestClient

from app.constants import ETHICAL_DISCLAIMER, FEATURE_NAMES
from app.main import create_app


def test_health_reports_loaded_model(trained_artifact: tuple) -> None:
    artifact_path, metadata = trained_artifact
    with TestClient(create_app(artifact_path)) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "student-risk-ml",
        "model_loaded": True,
        "model_version": metadata["model_version"],
        "synthetic_training_data": True,
    }


def test_health_fails_when_artifact_is_missing(tmp_path) -> None:
    with TestClient(create_app(tmp_path / "missing.joblib")) as client:
        response = client.get("/health")
        prediction = client.post(
            "/predict",
            json={
                "attendance_percentage": 80,
                "average_marks": 70,
                "assignment_completion_rate": 75,
                "recent_grade_trend": 0,
                "missed_assignments": 1,
            },
        )

    assert response.status_code == 503
    assert response.json()["model_loaded"] is False
    assert prediction.status_code == 503
    assert prediction.json() == {"detail": "The prediction model is unavailable."}


def test_prediction_contract(trained_artifact: tuple, valid_payload: dict) -> None:
    artifact_path, metadata = trained_artifact
    with TestClient(create_app(artifact_path)) as client:
        response = client.post("/predict", json=valid_payload)

    assert response.status_code == 200
    body = response.json()
    assert body["risk_level"] in {"LOW", "MEDIUM", "HIGH"}
    assert body["model_version"] == metadata["model_version"]
    assert body["training_data"] == "synthetic_demo"
    assert body["disclaimer"] == ETHICAL_DISCLAIMER
    assert set(body["probabilities"]) == {"LOW", "MEDIUM", "HIGH"}
    assert math.isclose(sum(body["probabilities"].values()), 1.0, abs_tol=1e-9)
    assert body["confidence"] == body["probabilities"][body["risk_level"]]
    assert {item["feature"] for item in body["feature_contributions"]} == set(
        FEATURE_NAMES
    )
    assert all("direction" in item for item in body["feature_contributions"])
    contributions = [
        abs(item["contribution"]) for item in body["feature_contributions"]
    ]
    assert contributions == sorted(contributions, reverse=True)


def test_invalid_features_are_rejected(
    trained_artifact: tuple, valid_payload: dict
) -> None:
    artifact_path, _ = trained_artifact
    invalid = {**valid_payload, "attendance_percentage": 101, "student_name": "No PII"}
    with TestClient(create_app(artifact_path)) as client:
        response = client.post("/predict", json=invalid)

    assert response.status_code == 422
    error_locations = {tuple(error["loc"]) for error in response.json()["detail"]}
    assert ("body", "attendance_percentage") in error_locations
    assert ("body", "student_name") in error_locations


def test_missed_assignments_requires_an_integer(
    trained_artifact: tuple, valid_payload: dict
) -> None:
    artifact_path, _ = trained_artifact
    invalid = {**valid_payload, "missed_assignments": 1.5}
    with TestClient(create_app(artifact_path)) as client:
        response = client.post("/predict", json=invalid)

    assert response.status_code == 422


def test_non_finite_features_are_rejected(
    trained_artifact: tuple, valid_payload: dict
) -> None:
    artifact_path, _ = trained_artifact
    body = (
        '{"attendance_percentage": NaN, "average_marks": 70, '
        '"assignment_completion_rate": 75, "recent_grade_trend": 0, '
        '"missed_assignments": 1}'
    )
    with TestClient(create_app(artifact_path)) as client:
        response = client.post(
            "/predict", content=body, headers={"content-type": "application/json"}
        )

    assert response.status_code == 422


def test_incomplete_model_metadata_fails_closed(
    trained_artifact: tuple, tmp_path
) -> None:
    artifact_path, _ = trained_artifact
    incomplete_artifact = joblib.load(artifact_path)
    incomplete_artifact["metadata"].pop("model_version")
    invalid_path = tmp_path / "invalid.joblib"
    joblib.dump(incomplete_artifact, invalid_path)

    with TestClient(create_app(invalid_path)) as client:
        response = client.get("/health")

    assert response.status_code == 503
    assert response.json()["model_loaded"] is False


def test_batch_prediction_is_bounded(
    trained_artifact: tuple, valid_payload: dict
) -> None:
    artifact_path, _ = trained_artifact
    with TestClient(create_app(artifact_path)) as client:
        success = client.post(
            "/predict/batch", json={"students": [valid_payload, valid_payload]}
        )
        too_many = client.post(
            "/predict/batch", json={"students": [valid_payload] * 101}
        )

    assert success.status_code == 200
    assert len(success.json()["predictions"]) == 2
    assert too_many.status_code == 422


def test_metrics_are_disclosed_as_synthetic(trained_artifact: tuple) -> None:
    artifact_path, metadata = trained_artifact
    with TestClient(create_app(artifact_path)) as client:
        response = client.get("/metrics")

    assert response.status_code == 200
    body = response.json()
    assert body["training_data"] == "synthetic_demo"
    assert body["synthetic_samples"] == 600
    assert body["metrics"] == metadata["metrics"]
    assert sum(sum(row) for row in body["metrics"]["confusion_matrix"]) == body[
        "metrics"
    ]["test_samples"]
    assert math.isclose(sum(body["global_feature_importance"].values()), 1.0)
