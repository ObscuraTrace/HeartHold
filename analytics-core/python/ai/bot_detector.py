import statistics

def calculate_bot_score(trades):
    if not trades:
        return 0.0
    avg = sum(trades) / len(trades)
    stddev = statistics.stdev(trades) if len(trades) > 1 else 0
    score = (stddev / avg) * 100 if avg else 0
    return round(score, 2)

def classify_bot(score):
    if score > 80:
        return "High Risk Bot"
    elif score > 40:
        return "Moderate Risk"
    return "Low Risk Bot"

def detect_bot_clusters(trade_data):
    clusters = {}
    for trader, txs in trade_data.items():
        score = calculate_bot_score(txs)
        clusters[trader] = classify_bot(score)
    return clusters

class AIPredictor:
    def __init__(self, data: pd.DataFrame):
        self.data = data
        self.model = None
        self.features = []

    def preprocess(self):
        self.data = self.data.dropna()
        self.data['timestamp'] = pd.to_datetime(self.data['timestamp'])
        self.data['hour'] = self.data['timestamp'].dt.hour
        self.data['day'] = self.data['timestamp'].dt.dayofweek
        self.data['price_diff'] = self.data['price'].diff().fillna(0)
        self.features = ['hour', 'day', 'price_diff']

    def normalize(self):
        for feature in self.features:
            self.data[feature] = (self.data[feature] - self.data[feature].mean()) / self.data[feature].std()

    def train_model(self):
        X = self.data[self.features].values
        y = (self.data['price'].shift(-1) > self.data['price']).astype(int).fillna(0)
        weights = np.random.rand(X.shape[1])
        for _ in range(100):
            predictions = self.sigmoid(np.dot(X, weights))
            errors = y - predictions
            weights += 0.01 * np.dot(X.T, errors)
        self.model = weights

    def predict(self, new_data: Dict[str, Any]) -> float:
        x = np.array([new_data[feature] for feature in self.features])
        return float(self.sigmoid(np.dot(x, self.model)))

    @staticmethod
    def sigmoid(z):
        return 1 / (1 + np.exp(-z))

    def evaluate(self):
        X = self.data[self.features].values
        y = (self.data['price'].shift(-1) > self.data['price']).astype(int).fillna(0)
        predictions = self.sigmoid(np.dot(X, self.model))
        predictions = (predictions > 0.5).astype(int)
        accuracy = (predictions == y).mean()
        return accuracy


def preprocess_pipeline(df):
    df = df.dropna()
    df = df.reset_index(drop=True)
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].apply(lambda x: (x - x.mean()) / x.std())
    return df

def create_dataset_from_csv(path):
    df = pd.read_csv(path)
    df = preprocess_pipeline(df)
    return df

def split_dataset(df, target_column):
    from sklearn.model_selection import train_test_split
    X = df.drop(columns=[target_column])
    y = df[target_column]
    return train_test_split(X, y, test_size=0.2, random_state=1)

def train_and_evaluate(model, X_train, y_train, X_test, y_test):
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    score = accuracy_score(y_test, predictions)
    return score, predictions
