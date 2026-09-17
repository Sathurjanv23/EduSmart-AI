"""Deterministic offline training for the synthetic demonstration model.

The generated records are artificial and contain no real student information.
Metrics are calculated on a held-out portion of that synthetic data and must not
be described as evidence of real-world model quality.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import tempfile
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import sklearn
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from .constants import (
    FEATURE_NAMES,
    MODEL_SCHEMA_VERSION,
    RISK_LEVELS,
    SYNTHETIC_DATA_NOTICE,
)
from .settings import PROJECT_ROOT


def generate_synthetic_data(
    samples: int = 3_000, seed: int = 42
) -> tuple[np.ndarray, np.ndarray, dict[str, float]]:
    """Generate coherent, labelled demo records from a documented risk rule."""
    if samples < 300:
        raise ValueError("At least 300 synthetic samples are required for training.")

    rng = np.random.default_rng(seed)
    engagement = rng.beta(2.2, 1.8, samples)
    aptitude = rng.beta(2.4, 2.0, samples)

    attendance = np.clip(42 + 58 * engagement + rng.normal(0, 5, samples), 0, 100)
    average_marks = np.clip(
        22 + 44 * aptitude + 30 * engagement + rng.normal(0, 7, samples), 0, 100
    )
    completion = np.clip(
        25 + 69 * engagement + rng.normal(0, 8, samples), 0, 100
    )
    recent_trend = np.clip(
        rng.normal((average_marks - 60) * 0.09, 7, samples), -30, 30
    )
    missed = np.clip(
        np.rint((100 - completion) / 14 + rng.poisson(0.8, samples)), 0, 15
    ).astype(int)

    features = np.column_stack(
        (attendance, average_marks, completion, recent_trend, missed)
    ).astype(np.float64)

    risk_score = (
        0.28 * (100 - attendance)
        + 0.36 * (100 - average_marks)
        + 0.20 * (100 - completion)
        + 0.75 * np.maximum(-recent_trend, 0)
        + 3.6 * missed
        + rng.normal(0, 4.5, samples)
    )
    low_threshold, high_threshold = np.quantile(risk_score, (0.36, 0.70))
    labels = np.where(
        risk_score <= low_threshold,
        "LOW",
        np.where(risk_score <= high_threshold, "MEDIUM", "HIGH"),
    )

    return features, labels, {
        "low_to_medium": float(low_threshold),
        "medium_to_high": float(high_threshold),
    }


def _model_version(samples: int, seed: int) -> str:
    contract = json.dumps(
        {
            "schema": MODEL_SCHEMA_VERSION,
            "features": FEATURE_NAMES,
            "algorithm": "standard-scaler-logistic-regression",
            "samples": samples,
            "seed": seed,
            "synthetic_generator": 1,
        },
        sort_keys=True,
    ).encode("utf-8")
    return f"synthetic-v1-{hashlib.sha256(contract).hexdigest()[:12]}"


def _calculate_metrics(
    expected: np.ndarray, predicted: np.ndarray
) -> dict[str, Any]:
    report = classification_report(
        expected,
        predicted,
        labels=list(RISK_LEVELS),
        output_dict=True,
        zero_division=0,
    )
    per_class = {
        label: {
            "precision": float(report[label]["precision"]),
            "recall": float(report[label]["recall"]),
            "f1": float(report[label]["f1-score"]),
            "support": int(report[label]["support"]),
        }
        for label in RISK_LEVELS
    }
    return {
        "accuracy": float(accuracy_score(expected, predicted)),
        "precision_macro": float(
            precision_score(expected, predicted, average="macro", zero_division=0)
        ),
        "recall_macro": float(
            recall_score(expected, predicted, average="macro", zero_division=0)
        ),
        "f1_macro": float(f1_score(expected, predicted, average="macro")),
        "confusion_matrix": confusion_matrix(
            expected, predicted, labels=list(RISK_LEVELS)
        ).astype(int).tolist(),
        "labels": list(RISK_LEVELS),
        "per_class": per_class,
        "test_samples": int(len(expected)),
    }


def _atomic_joblib_dump(bundle: dict[str, Any], destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    handle, temporary_name = tempfile.mkstemp(
        dir=destination.parent, prefix=f".{destination.name}.", suffix=".tmp"
    )
    os.close(handle)
    temporary_path = Path(temporary_name)
    try:
        joblib.dump(bundle, temporary_path, compress=3)
        os.replace(temporary_path, destination)
    finally:
        temporary_path.unlink(missing_ok=True)


def _atomic_json_dump(payload: dict[str, Any], destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    handle, temporary_name = tempfile.mkstemp(
        dir=destination.parent,
        prefix=f".{destination.name}.",
        suffix=".tmp",
        text=True,
    )
    temporary_path = Path(temporary_name)
    try:
        with os.fdopen(handle, "w", encoding="utf-8") as stream:
            json.dump(payload, stream, indent=2, sort_keys=True)
            stream.write("\n")
        os.replace(temporary_path, destination)
    finally:
        temporary_path.unlink(missing_ok=True)


def train_model(
    output_path: Path | str,
    metrics_output_path: Path | str | None = None,
    *,
    samples: int = 3_000,
    seed: int = 42,
) -> dict[str, Any]:
    features, labels, label_thresholds = generate_synthetic_data(samples, seed)
    train_features, test_features, train_labels, test_labels = train_test_split(
        features,
        labels,
        test_size=0.2,
        random_state=seed,
        stratify=labels,
    )

    pipeline = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            (
                "classifier",
                LogisticRegression(
                    C=1.0,
                    max_iter=2_000,
                    random_state=seed,
                    solver="lbfgs",
                ),
            ),
        ]
    )
    pipeline.fit(train_features, train_labels)
    predictions = pipeline.predict(test_features)
    metrics = _calculate_metrics(test_labels, predictions)

    classifier = pipeline.named_steps["classifier"]
    importance_values = np.mean(np.abs(classifier.coef_), axis=0)
    importance_values = importance_values / importance_values.sum()
    global_importance = {
        feature: float(value)
        for feature, value in zip(FEATURE_NAMES, importance_values, strict=True)
    }

    metadata: dict[str, Any] = {
        "model_version": _model_version(samples, seed),
        "schema_version": MODEL_SCHEMA_VERSION,
        "algorithm": "StandardScaler + multinomial LogisticRegression",
        "feature_names": list(FEATURE_NAMES),
        "risk_levels": list(RISK_LEVELS),
        "training_data": "synthetic_demo",
        "synthetic_samples": samples,
        "random_seed": seed,
        "label_thresholds": label_thresholds,
        "metrics": metrics,
        "global_feature_importance": global_importance,
        "data_notice": SYNTHETIC_DATA_NOTICE,
        "scikit_learn_version": sklearn.__version__,
    }
    artifact = {"pipeline": pipeline, "metadata": metadata}
    output = Path(output_path).expanduser().resolve()
    _atomic_joblib_dump(artifact, output)

    if metrics_output_path is not None:
        _atomic_json_dump(metadata, Path(metrics_output_path).expanduser().resolve())
    return metadata


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Train the student-risk demonstration model using only deterministic "
            "synthetic data. No production student records are read."
        )
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=PROJECT_ROOT / "artifacts" / "student_risk_pipeline.joblib",
        help="Destination for the persisted joblib artifact.",
    )
    parser.add_argument(
        "--metrics-output",
        type=Path,
        default=PROJECT_ROOT / "artifacts" / "training_metrics.json",
        help="Destination for human-readable metrics and metadata JSON.",
    )
    parser.add_argument("--samples", type=int, default=3_000)
    parser.add_argument("--seed", type=int, default=42)
    return parser


def main() -> None:
    args = _build_parser().parse_args()
    metadata = train_model(
        args.output,
        args.metrics_output,
        samples=args.samples,
        seed=args.seed,
    )
    summary = {
        "artifact": str(args.output.resolve()),
        "metrics": str(args.metrics_output.resolve()),
        "model_version": metadata["model_version"],
        "training_data": metadata["training_data"],
        "test_metrics": metadata["metrics"],
        "notice": SYNTHETIC_DATA_NOTICE,
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
