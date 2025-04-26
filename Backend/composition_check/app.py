import re
import numpy as np
import pandas as pd
import joblib
from zxcvbn import zxcvbn
import shap
from pathlib import Path

#### SHAP 

# 0 : ignored no any impact
# +ve : Feature pushed the prediction higher (i.e., made password stronger).
# -ve : Feature pulled the prediction lower (i.e., made password weaker).

current_dir = Path(__file__).parent if "__file__" in locals() else Path.cwd()

# Construct full paths
model_path = current_dir / "models" / "random_forest_model.pkl"
preprocessor_path = current_dir / "models" / "preprocessor.pkl"

# Load models and preprocessor
rf_model = joblib.load(model_path)
preprocessor = joblib.load(preprocessor_path)

explainer = shap.Explainer(rf_model)

def extract_features(password):
    result = zxcvbn(password)
    sequence = result.get("sequence", [])

    length = len(password)
    entropy = result.get('guesses_log10', 0)

    shannon_entropy = -sum(
        (password.count(char) / length) * np.log2(password.count(char) / length)
        for char in set(password)
    ) if length > 0 else 0

    num_unique_chars = len(set(password))
    unique_char_ratio = num_unique_chars / length if length > 0 else 0

    has_upper_lower = int(any(c.islower() for c in password) and any(c.isupper() for c in password))
    digit_seq = int(bool(re.search(r'\d{2,}', password)))
    digit_ratio = sum(c.isdigit() for c in password) / length if length > 0 else 0
    special_seq = int(bool(re.search(r'[^A-Za-z0-9]{2,}', password)))
    special_ratio = sum(not c.isalnum() for c in password) / length if length > 0 else 0

    num_digits = sum(c.isdigit() for c in password)
    num_special = sum(not c.isalnum() for c in password)
    num_upper = sum(c.isupper() for c in password)
    num_lower = sum(c.islower() for c in password)

    upper_case_ratio = num_upper / length if length > 0 else 0
    lower_case_ratio = num_lower / length if length > 0 else 0
    num_repeated_chars = sum(password.count(c) > 1 for c in set(password))

    dictionary_match_count = sum(1 for m in sequence if m.get('pattern') == 'dictionary')
    sequence_match_count = sum(1 for m in sequence if m.get('pattern') == 'sequence')
    repeat_match_count = sum(1 for m in sequence if m.get('pattern') == 'repeat')
    l33t_match_count = sum(1 for m in sequence if m.get('l33t', False))

    # Dictionary of all features
    features = {
        'length': length,
        'entropy': entropy,
        'shannon_entropy': shannon_entropy,
        'num_unique_chars': num_unique_chars,
        'unique_char_ratio': unique_char_ratio,
        'has_upper_lower': has_upper_lower,
        'digit_seq': digit_seq,
        'digit_ratio': digit_ratio,
        'special_seq': special_seq,
        'special_ratio': special_ratio,
        'upper_case_ratio': upper_case_ratio,
        'lower_case_ratio': lower_case_ratio,
        'num_digits': num_digits,
        'num_special': num_special,
        'num_upper': num_upper,
        'num_lower': num_lower,
        'num_repeated_chars': num_repeated_chars,
        'dictionary_match_count': dictionary_match_count,
        'sequence_match_count': sequence_match_count,
        'repeat_match_count': repeat_match_count,
        'l33t_match_count': l33t_match_count
    }

    # Rounding rules
    rounding_rules = {
        'entropy': 4,
        'shannon_entropy': 4,
        'unique_char_ratio': 4,
        'digit_ratio': 4,
        'special_ratio': 4,
        'upper_case_ratio': 4,
        'lower_case_ratio': 4,
    }

    # Apply rounding
    for key, decimals in rounding_rules.items():
        features[key] = round(features[key], decimals)

    return features,list(features.values())


# All feature names
feature_names = [
    'length', 'entropy', 'shannon_entropy', 'num_unique_chars', 'unique_char_ratio',
    'has_upper_lower', 'digit_seq', 'digit_ratio', 'special_seq', 'special_ratio',
    'upper_case_ratio', 'lower_case_ratio', 'num_digits', 'num_special',
    'num_upper', 'num_lower', 'num_repeated_chars',
    'dictionary_match_count', 'sequence_match_count',
    'repeat_match_count', 'l33t_match_count'
]

def clean_shap_impact(shap_dict, round_to=3):
    cleaned = {}
    for feature, value in shap_dict.items():
        if isinstance(value, (int, float)):
            rounded = round(value, round_to)
            if abs(rounded) > 0.001:
                cleaned[feature] = rounded
    return cleaned


def password_strength_generator(password):
    features_dic,features = extract_features(password)
    df_input = pd.DataFrame([features], columns=feature_names)
    processed = preprocessor.transform(df_input)

    # Predict score
    rf_score = rf_model.predict(processed)[0]

    # SHAP Values
    shap_values = explainer(processed)
    feature_importance = dict(zip(feature_names, shap_values.values[0]))
    feature_importance = clean_shap_impact(feature_importance)
    return {
        "score": round(rf_score, 2),
        "features": features_dic,
        "shap_impact": feature_importance
    }
    

# password = "summar@124"
# print(password_strength_generator(password))

# def predict_strength(password):
#     features = extract_features(password)
#     df_input = pd.DataFrame([features], columns=feature_names)

#     processed = preprocessor.transform(df_input)

#     rf_score = rf_model.predict(processed)[0]
#     xgb_score = xgb_model.predict(processed)[0]

#     print(f"\n🔐 Password: {password}")
#     print(f"🧠 Random Forest Score: {round(rf_score, 2)} / 10")
#     print(f"⚡ XGBoost Score: {round(xgb_score, 2)} / 10")
    

# # Entry point
# if __name__ == "__main__":
#     while True:
#         user_input = input("\nEnter password (or 'exit' to quit): ")
#         if user_input.lower() == 'exit':
#             break
#         predict_strength(user_input)
