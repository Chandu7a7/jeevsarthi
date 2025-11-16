"""
Simple ML model training script for MRL prediction
This creates a basic linear regression model
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

# Create data directory if it doesn't exist
os.makedirs('data', exist_ok=True)
os.makedirs('model', exist_ok=True)

# Generate synthetic training data
np.random.seed(42)
n_samples = 1000

data = {
    'dosage': np.random.uniform(0, 200, n_samples),
    'frequency': np.random.choice([1, 2, 3, 7], n_samples),
    'drug_type': np.random.choice([1, 2, 3, 4, 0], n_samples),
    'animal_age': np.random.uniform(0.5, 10, n_samples),
    'previous_violations': np.random.choice([0, 1, 2, 3], n_samples),
}

df = pd.DataFrame(data)

# Calculate target (MRL violation risk score)
# Higher dosage, frequency, and violations increase risk
df['risk_score'] = (
    df['dosage'] * 0.003 +
    df['frequency'] * 0.05 +
    df['drug_type'] * 0.02 +
    df['previous_violations'] * 0.15 +
    np.random.normal(0, 0.1, n_samples)
)

# Clamp risk score between 0 and 1
df['risk_score'] = np.clip(df['risk_score'], 0, 1)

# Save training data
df.to_csv('data/training_data.csv', index=False)
print(f"Generated {n_samples} training samples")

# Prepare features and target
X = df[['dosage', 'frequency', 'drug_type', 'animal_age', 'previous_violations']]
y = df['risk_score']

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = LinearRegression()
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"\nModel Performance:")
print(f"MSE: {mse:.4f}")
print(f"R² Score: {r2:.4f}")

# Save model
model_path = 'model/amu_predictor.pkl'
joblib.dump(model, model_path)
print(f"\n✅ Model saved to {model_path}")

