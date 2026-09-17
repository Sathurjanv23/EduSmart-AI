FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    MODEL_PATH=/app/artifacts/student_risk_pipeline.joblib

WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app

COPY requirements.txt ./
RUN python -m pip install --no-cache-dir --requirement requirements.txt

COPY app ./app
RUN mkdir -p /app/artifacts \
    && python -m app.training \
        --samples 3000 \
        --seed 42 \
        --output /app/artifacts/student_risk_pipeline.joblib \
        --metrics-output /app/artifacts/training_metrics.json \
    && chown -R app:app /app

USER app
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=3)"]

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
