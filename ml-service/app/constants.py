"""Shared model contract constants.

Changing feature names or their order is a model schema change. Train and deploy a
new artifact whenever this contract changes.
"""

from typing import Final

FEATURE_NAMES: Final[tuple[str, ...]] = (
    "attendance_percentage",
    "average_marks",
    "assignment_completion_rate",
    "recent_grade_trend",
    "missed_assignments",
)

RISK_LEVELS: Final[tuple[str, ...]] = ("LOW", "MEDIUM", "HIGH")
MODEL_SCHEMA_VERSION: Final[int] = 1
DEFAULT_MODEL_FILENAME: Final[str] = "student_risk_pipeline.joblib"
SYNTHETIC_DATA_NOTICE: Final[str] = (
    "This demonstration model was trained only on reproducible synthetic data; "
    "its metrics do not represent performance on real students."
)
ETHICAL_DISCLAIMER: Final[str] = (
    "This prediction is decision support for qualified educators. It must not be "
    "used to punish, exclude, or automatically label a student. Review context, "
    "data quality, and potential bias before acting."
)
