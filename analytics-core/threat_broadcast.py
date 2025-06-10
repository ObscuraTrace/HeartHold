import json
from datetime import datetime

def generate_json_report(data, filename="report.json"):
    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": data
    }
    with open(filename, "w") as f:
        json.dump(report, f, indent=2)
    return filename

def calculate_entropy_distribution(distribution: Dict[str, float]) -> float:
    total = sum(distribution.values())
    entropy = 0.0
    for value in distribution.values():
        if value > 0:
            prob = value / total
            entropy -= prob * math.log(prob + 1e-8)
    return entropy


def price_variation_intensity(prices: List[float]) -> float:
    if len(prices) < 2:
        return 0.0
    differences = [abs(prices[i+1] - prices[i]) for i in range(len(prices) - 1)]
    return np.mean(differences)
