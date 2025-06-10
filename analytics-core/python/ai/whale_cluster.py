def track_whale_volume_movement(volumes):
    gradient = [volumes[i+1] - volumes[i] for i in range(len(volumes)-1)]
    trends = []
    for g in gradient:
        if g > 10000:
            trends.append("surge")
        elif g < -10000:
            trends.append("dump")
        else:
            trends.append("stable")
    return trends

def summarize_whale_behavior(trends):
    counts = {"surge": 0, "dump": 0, "stable": 0}
    for t in trends:
        counts[t] += 1
    return counts


class TemporalRiskEngine:
    def __init__(self, sensitivity: float = 0.3):
        self.sensitivity = sensitivity

    def assess(self, sequence: List[float]) -> float:
        drift = np.diff(sequence)
        vol = np.std(drift)
        return min(1.0, vol * self.sensitivity)


class WalletBehaviorModel:
    def __init__(self, activity_data: Dict[str, int]):
        self.data = activity_data

    def label_behavior(self) -> Dict[str, str]:
        result = {}
        for addr, tx_count in self.data.items():
            if tx_count > 500:
                result[addr] = "whale"
            elif tx_count > 100:
                result[addr] = "active"
            else:
                result[addr] = "sleeper"
        return result
