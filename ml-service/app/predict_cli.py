"""One-record prediction smoke test for a persisted model artifact."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from .predictor import StudentRiskPredictor
from .schemas import PredictionInput
from .settings import get_settings


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run one local student-risk prediction.")
    parser.add_argument("--model", type=Path, default=None)
    parser.add_argument("--attendance", type=float, required=True)
    parser.add_argument("--marks", type=float, required=True)
    parser.add_argument("--completion", type=float, required=True)
    parser.add_argument("--trend", type=float, required=True)
    parser.add_argument("--missed", type=int, required=True)
    return parser


def main() -> None:
    args = _parser().parse_args()
    model_path = args.model or get_settings().model_path
    features = PredictionInput(
        attendance_percentage=args.attendance,
        average_marks=args.marks,
        assignment_completion_rate=args.completion,
        recent_grade_trend=args.trend,
        missed_assignments=args.missed,
    )
    result = StudentRiskPredictor(model_path).predict(features)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
