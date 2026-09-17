# Student Performance Risk ML Service

This internal FastAPI service predicts `LOW`, `MEDIUM`, or `HIGH` academic risk
from five aggregate indicators. It uses a persisted scikit-learn pipeline
(`StandardScaler` plus multinomial logistic regression) and returns class
probabilities, per-prediction feature contributions, and measured holdout
metrics.

The demonstration artifact is trained **only on deterministic synthetic data**.
Its metrics describe that synthetic holdout set; they are not evidence of
performance on real students. Predictions are decision support and must never
automatically punish, exclude, or label a student.

## Local development

```bash
python -m venv .venv
# PowerShell: .venv\Scripts\Activate.ps1
# bash: source .venv/bin/activate
python -m pip install -r requirements-dev.txt
python -m app.training
pytest
uvicorn app.main:app --reload
```

Swagger UI is available at `http://localhost:8000/docs`. The Spring Boot backend
should call this service internally; browsers should use the authenticated
Spring endpoint, not expose FastAPI directly in production.

## Reproducible commands

```bash
python -m app.training --samples 3000 --seed 42 \
  --output artifacts/student_risk_pipeline.joblib \
  --metrics-output artifacts/training_metrics.json

python -m app.predict_cli \
  --model artifacts/student_risk_pipeline.joblib \
  --attendance 88 --marks 74 --completion 90 --trend 3 --missed 1
```

`POST /predict` accepts:

```json
{
  "attendance_percentage": 88,
  "average_marks": 74,
  "assignment_completion_rate": 90,
  "recent_grade_trend": 3,
  "missed_assignments": 1
}
```

Health is reported by `GET /health`, and honest training metadata is available
from `GET /metrics`. A missing or incompatible model makes health and prediction
requests return HTTP 503.
