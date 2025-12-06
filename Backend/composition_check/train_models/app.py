import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import root_mean_squared_error ,r2_score

import pickle

# -------------------------
# Step 1: Load the Data
# -------------------------
df = pd.read_csv("./password_strength_dataset.csv")
print("Data loaded successfully..")
# -------------------------
# Step 2: Basic Exploration
# -------------------------
print("Dataset shape:", df.shape)
print(df.info())
print(df.describe())

# Optional: check score distribution
sns.histplot(df['score'], bins=11, kde=True)
plt.title("Score Distribution")
plt.show()

# -------------------------
# Step 3: Preprocessing
# -------------------------
# Check and fill or drop missing values if any
df = df.dropna()  # or use df.fillna(method='ffill') if needed

# rounding some features
def round_password_features(df):
    # Create a copy to avoid modifying original data
    df = df.copy()
    # Rounding specifications
    rounding_rules = {
        'entropy': 4,
        'shannon_entropy': 4,
        'unique_char_ratio': 4,
        'digit_ratio': 4,
        'special_ratio': 4,
        'upper_case_ratio': 4,
        'lower_case_ratio': 4,
    }
    return df.round(rounding_rules)

rounded_df = round_password_features(df)

# -------------------------
# Step 4: Feature/Target Split
# -------------------------
X = rounded_df.drop(columns=['score'])
y = rounded_df['score']

# -------------------------
# Step 5: Train/Test Split
# -------------------------
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# -------------------------
# Step 6: Preprocessing Pipeline
# -------------------------
pipeline = Pipeline([
    ('scaler', StandardScaler())
])

X_train_scaled = pipeline.fit_transform(X_train)
X_test_scaled = pipeline.transform(X_test)

# -------------------------
# Step 7: Train Models
# -------------------------

# Random Forest
rf = RandomForestRegressor(n_estimators=100, random_state=42)
rf.fit(X_train_scaled, y_train)
rf_preds = rf.predict(X_test_scaled)

print("\nRandom Forest Metrics:")
print("R2 Score:", r2_score(y_test, rf_preds))
rmse = root_mean_squared_error(y_test, rf_preds)
print("RMSE:", rmse)

# XGBoost
xgb = XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
xgb.fit(X_train_scaled, y_train)
xgb_preds = xgb.predict(X_test_scaled)

print("\nXGBoost Metrics:")
print("R2 Score:", r2_score(y_test, xgb_preds))
rmse = root_mean_squared_error(y_test, xgb_preds)
print("RMSE:", rmse)
# -------------------------
# Step 8: Save Models and Pipeline
# -------------------------
with open("models/random_forest_model.pkl", "wb") as f:
    pickle.dump(rf, f)

# with open("xgboost_model.pkl", "wb") as f:
#     pickle.dump(xgb, f)

# with open("scaler_pipeline.pkl", "wb") as f:
#     pickle.dump(pipeline, f)

print("\n✅ Models and scaler pipeline saved successfully.")
