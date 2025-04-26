from zxcvbn import zxcvbn
import math
import pickle
import os
from pathlib import Path

REVERSE_LEET_MAP = {
    '4': 'a', '@': 'a', '^': 'a', 'λ': 'a',
    '8': 'b', '|3': 'b', 'ß': 'b',
    '¢': 'c', '(': 'c', '<': 'c', '{': 'c',
    '|)': 'd', 'đ': 'd',
    '3': 'e', '€': 'e', '&': 'e',
    'ƒ': 'f', '|=': 'f',
    '6': 'g', '9': 'g',
    '#': 'h', '|-|': 'h',
    '1': 'i', '!': 'i', '|': 'i',
    '_|': 'j',
    '|<': 'k',
    '|_': 'l',
    '\\/\\/\\': 'm', '|\\/|': 'm', 'em': 'm',
    '|\\|': 'n',
    '\\/': 'v',
    '\\/\\/': 'w', '\\^/': 'w', '\\|/': 'w', 'vv': 'w',
    '0': 'o', '()': 'o',
    '|*': 'p',
    '|2': 'r', '®': 'r',
    '5': 's', '$': 's',
    '7': 't', '+': 't',
    '|_|': 'u',
    '><': 'x',
    '`/': 'y',
    '2': 'z',
}

# Step 2: Sort patterns for greedy matching
sorted_patterns = sorted(REVERSE_LEET_MAP.keys(), key=lambda x: -len(x))

# Step 3: Recursive generator
def generate_normalized_variants(password):
    variants = set()

    def helper(remaining, current):
        if not remaining:
            variants.add(current)
            return

        matched = False
        for pattern in sorted_patterns:
            if remaining.startswith(pattern):
                replacement = REVERSE_LEET_MAP[pattern]
                # Only replace if it's a true leet character, not a normal letter
                if pattern != replacement:
                    helper(remaining[len(pattern):], current + replacement)
                    matched = True

        # Always try keeping the original character (no leet conversion)
        helper(remaining[1:], current + remaining[0])


    helper(password, "")
    return variants


# Load banned words for zxcvbn user_inputs
def load_banned_words_from_files(folder_path):
    all_banned_words = set()
    for filename in os.listdir(folder_path):
        if filename.startswith("banned_words_") and filename.endswith(".pkl"):
            file_path = os.path.join(folder_path, filename)
            with open(file_path, "rb") as f:
                words = pickle.load(f)
                all_banned_words.update(words)
    
    return list(all_banned_words)


# Check weakest score among all variants
def get_min_strength_score(password,custom_inputs):
    variants = generate_normalized_variants(password)
    variants.add(password)

    min_score = 5
    weakest_result = None
    weakest_variant = None

    for variant in variants:
        result = zxcvbn(variant, user_inputs=custom_inputs or [])
        if result['score'] < min_score:
            min_score = result['score']
            weakest_variant = variant
            weakest_result = result

    return weakest_variant,weakest_result

def entropy_score(result):
    return math.log2(result['guesses']) if result['guesses'] > 0 else 0


def extract_pattern_info(sequence):
    """Extract and format matched patterns from zxcvbn results."""
    patterns = []
    for item in sequence:
        patterns.append({
            "pattern": item.get("pattern"),
            "token": item.get("token"),
            "dictionary_name": item.get("dictionary_name", None),
            "matched_word": item.get("matched_word", None),
            "rank": item.get("rank", None)
        })
    return patterns

def analyze_password_variants(password, custom_inputs):
    original_result = zxcvbn(password, user_inputs=custom_inputs)
    weakest_variant, normalized_result = get_min_strength_score(password.lower(), custom_inputs)

    original_data = {
        "password": password,
        "score": original_result.get("score", 0),
        "guesses": float(original_result.get("guesses", 0)),  # Convert to float
        "entropy": round(float(original_result.get("guesses_log10", 0.0)), 2),  # Convert first
        "patterns": extract_pattern_info(original_result.get("sequence", [])),
        "warning": original_result.get("feedback", {}).get("warning", ""),
        "suggestions": original_result.get("feedback", {}).get("suggestions", [])
    }

    normalized_data = {
        "password": weakest_variant,
        "score": normalized_result.get("score", 0),
        "guesses": float(normalized_result.get("guesses", 0)),  # Convert to float
        "entropy": round(float(normalized_result.get("guesses_log10", 0.0)), 2),
        "patterns": extract_pattern_info(normalized_result.get("sequence", [])),
        "warning": normalized_result.get("feedback", {}).get("warning", ""),
        "suggestions": normalized_result.get("feedback", {}).get("suggestions", [])
    }

    return {
        "original_password_analysis": original_data,
        "normalized_password_analysis": normalized_data,
        "normalized_is_weaker": normalized_data["score"] < original_data["score"]
    }

def ban_words_identification(password):
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    ban_data_path = os.path.join(CURRENT_DIR, "ban_words_collection")
    custom_inputs = load_banned_words_from_files(ban_data_path)
    return analyze_password_variants(password, custom_inputs)

# print(ban_words_identification("$SPRING2020#"))

def analyze_password_variants_zxcvbn(password):
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    ban_data_path = os.path.join(CURRENT_DIR, "ban_words_collection")
    custom_inputs = load_banned_words_from_files(ban_data_path)
    original_result = zxcvbn(password, user_inputs=custom_inputs)
    score = original_result.get("score", 0)
    entropy_score = round(float(original_result.get("guesses_log10", 0.0)), 2)
    status = ""
    if score <=1 :  status = "weak"
    elif score <= 3: status = "moderate"
    elif score == 4 : status = "strong"
    elif entropy_score >= 25 : status = "very strong"
    return status




# def print_result(label,variant, result):
#     print(f"\n--- {label} - {variant} ---")
#     print("Score:", result['score'])
#     print("Guesses:", result['guesses'])
#     print("Entropy:", round(entropy_score(result), 2))
#     print("Matched patterns:", result["sequence"])
#     print("Warnings:", result['feedback']['warning'])
#     print("Suggestions:", result['feedback']['suggestions'])


# def analyze_password_variants(password,custom_inputs):
#     lowercased_password = password.lower()
#     # Run zxcvbn on original and normalized
#     original_result = zxcvbn(password, user_inputs=custom_inputs)
#     weakest_variant,normalized_result = get_min_strength_score(lowercased_password,custom_inputs)

#     # Display comparison
#     print_result("Original Password",password, original_result)
#     print_result("Normalized Password",weakest_variant ,normalized_result)

#     # Extra logic: If normalized is weak, raise flag
#     if normalized_result['score'] < original_result['score']:
#         print("\n⚠️ Warning: Obfuscated weak password detected (via leetspeak or tricks)!")
        

# def ban_words_indentification(password):
#     ban_data_path = "ban_words_collection"
#     custom_inputs = load_banned_words_from_files(ban_data_path)
#     analyze_password_variants(password,custom_inputs)
       

# if __name__ == "__main__":
#     ban_data_path = "ban_words_collection"
#     custom_inputs = load_banned_words_from_files(ban_data_path)
#     while True:
#         try:
#             password = input("\nEnter a password : ")
#             if password.lower() == "exit":
#                 break
#             analyze_password_variants(password,custom_inputs)
#         except KeyboardInterrupt:
#             break
