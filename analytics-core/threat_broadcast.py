import json
import os
import math
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Union

import numpy as np

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
logger.addHandler(handler)


def generate_json_report(
    data: Any,
    filename: Union[str, Path] = "report.json",
    indent: int = 2,
    overwrite: bool = True
) -> Path:
    """
    Generate a JSON report file containing a timestamp and summary data.

    :param data: Any serializable data to include under "summary"
    :param filename: File path to write the report
    :param indent: Number of spaces to indent JSON
    :param overwrite: If False and file exists, appends a timestamp suffix
    :return: Path to the written report file
    """
    path = Path(filename)
    if path.exists() and not overwrite:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        path = path.with_name(f"{path.stem}_{timestamp}{path.suffix}")

    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": data
    }

    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as f:
            json.dump(report, f, indent=indent)
        logger.info("Report written to %s", path)
    except Exception as e:
        logger.error("Failed to write report to %s: %s", path, e)
        raise

    return path


def calculate_entropy_distribution(distribution: Dict[str, float]) -> float:
    """
    Calculate the Shannon entropy of a probability distribution.

    :param distribution: Mapping of categories to non-negative weights
    :return: Entropy value in nats
    """
    total = sum(distribution.values())
    if total <= 0:
        logger.warning("Empty or zero-sum distribution: %s", distribution)
        return 0.0

    entropy = 0.0
    for value in distribution.values():
        if value <= 0:
            continue
        p = value / total
        entropy -= p * math.log(p)
    return entropy


def price_variation_intensity(
    prices: List[float]
) -> float:
    """
    Compute the mean absolute difference between consecutive price points.

    :param prices: Sequence of price floats
    :return: Average absolute variation, or 0.0 if insufficient data
    """
    if len(prices) < 2:
        return 0.0

    diffs = np.abs(np.diff(prices, dtype=float))
    intensity = float(np.mean(diffs))
    return intensity
