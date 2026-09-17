"""Environment-backed service settings without hidden network dependencies."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from .constants import DEFAULT_MODEL_FILENAME


PROJECT_ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Settings:
    model_path: Path
    log_level: str


def get_settings(model_path: Path | str | None = None) -> Settings:
    configured_path = model_path or os.getenv(
        "MODEL_PATH", str(PROJECT_ROOT / "artifacts" / DEFAULT_MODEL_FILENAME)
    )
    return Settings(
        model_path=Path(configured_path).expanduser().resolve(),
        log_level=os.getenv("LOG_LEVEL", "INFO").upper(),
    )
