import pandas as pd
import re
import math
from collections import Counter
from zxcvbn import zxcvbn

# Load passwords from file
def load_passwords(filepath, limit=None):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
        passwords = file.read().splitlines()
    if limit:
        passwords = passwords[:limit]
    return passwords


# Calculate features for each password
def calculate_features(password):
    length = len(password)
    num_unique_chars = len(set(password))
    unique_char_ratio = num_unique_chars / length if length > 0 else 0

    num_digits = sum(c.isdigit() for c in password)
    num_special = sum(not c.isalnum() for c in password)
    num_upper = sum(c.isupper() for c in password)
    num_lower = sum(c.islower() for c in password)

    digit_ratio = num_digits / length if length > 0 else 0
    special_ratio = num_special / length if length > 0 else 0
    upper_case_ratio = num_upper / length if length > 0 else 0
    lower_case_ratio = num_lower / length if length > 0 else 0

    has_upper_lower = int(num_upper > 0 and num_lower > 0)
    digit_seq = int(bool(re.search(r'\d{2,}', password)))
    special_seq = int(bool(re.search(r'[^A-Za-z0-9]{2,}', password)))

    repeated_chars = [char for char, count in Counter(password).items() if count > 1]
    num_repeated_chars = len(repeated_chars)

    prob = [n_x / length for x, n_x in Counter(password).items()]
    shannon_entropy = -sum([p * math.log2(p) for p in prob]) if length > 0 else 0

    # zxcvbn analysis
    analysis = zxcvbn(password)
    match_sequence = analysis.get('sequence', [])

    dictionary_match_count = sum(1 for match in match_sequence if match.get('pattern') == 'dictionary')
    sequence_match_count = sum(1 for match in match_sequence if match.get('pattern') == 'sequence')
    repeat_match_count = sum(1 for match in match_sequence if match.get('pattern') == 'repeat')
    l33t_match_count = sum(1 for match in match_sequence if match.get('pattern') == 'dictionary' and match.get('l33t'))

    return {
        'length': length,
        'entropy': analysis['guesses_log10'],
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
        'l33t_match_count': l33t_match_count,
        'score': analysis['score'] * 2.5  # zxcvbn score is 0-4, scaling to 0-10
    }

# Create DataFrame from list of passwords
def create_password_dataset(passwords):
    data = []
    for pw in passwords:
        try:
            features = calculate_features(pw)
            data.append(features)
        except Exception as e:
            print(f"Error with password '{pw}': {e}")
    return pd.DataFrame(data)

# Main function for Phase One
def phase_one(filepath, limit=None, output_csv='password_strength_dataset.csv'):
    passwords = load_passwords(filepath, limit)
    df = create_password_dataset(passwords)
    df.to_csv(output_csv, index=False)
    print(f"✅ Dataset saved to {output_csv} with {len(df)} records.")
    return df.head()


df_preview = phase_one("../combine_data/passwords_db.txt", limit=80000)
# here use rockyou (weak password data you can use other breached datasets)
print("Data generated successfully....")