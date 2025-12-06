import hashlib
import pickle
import os
from itertools import product, islice

# before running this script, make sure you have created bloom filters
# first run add_leak_words.py script to create pkl files
# using create_indexed_breached_words_pkl.py script and stored in bloom_filters folder


# === CONFIG ===
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FILTER_DIR = os.path.join(CURRENT_DIR, "bloom_filters")

MAX_VARIANTS = 50

# === LEET MULTI-MAP: Full Replacement Options ===
LEET_MULTI_MAP = {
    'a': ['4', '@', '^', 'λ'],
    'b': ['8', '|3', 'ß'],
    'c': ['¢', '(', '<', '{'],
    'd': ['|)', 'đ'],
    'e': ['3', '€', '&'],
    'f': ['ƒ', '|='],
    'g': ['6', '9'],
    'h': ['#', '|-|'],
    'i': ['1', '!', '|'],
    'j': ['_|'],
    'k': ['|<'],
    'l': ['1', '|_'],
    'm': ['\\/\\/\\', '|\\/|', 'em'],     
    'n': ['|\\|'],                       
    'v': ['\\/'],                        
    'w': ['\\/\\/', '\\^/', '\\|/', 'vv'] ,
    'o': ['0', '()'],
    'p': ['|*'],
    'q': ['9'],
    'r': ['|2', '®'],
    's': ['5', '$'],
    't': ['7', '+'],
    'u': ['|_|'],
    'w': ['\\/\\/'],
    'x': ['><'],
    'y': ['`/'],
    'z': ['2'],
    '0': ['o', 'ö', 'ó', 'ò', 'ô'],
    '1': ['i', 'l', 'ì', 'í', 'î'],
    '2': ['z', 'ž', 'ź', 'ż'],
    '3': ['e', 'ë', 'é', 'è'],
    '4': ['a', 'à', 'á', 'â'],
    '5': ['s', 'š', 'ś', 'ş'],
    '6': ['g', 'ĝ', 'ğ', 'ǧ'],
    '7': ['t', '†', 'ť', 'ţ'],
    '8': ['b', 'ß', 'ḃ', 'ḅ'],
    '9': ['g', 'q', 'ĝ', 'ǧ']
}

REVERSE_LEET_MAP = {
    '4': 'a', '@': 'a', '^': 'a', 'λ': 'a',
    '8': 'b', '|3': 'b', 'ß': 'b',
    '¢': 'c', '(': 'c', '<': 'c', '{': 'c',
    '|)': 'd', 'đ': 'd',
    '3': 'e', '€': 'e', '&': 'e',
    'ƒ': 'f', '|=': 'f',
    '6': 'g', '9': 'g',
    '#': 'h', '|-|': 'h',
    '1':'i','!': 'i', '|': 'i',
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
    '2': 'z'
}

# Step 2: Sort patterns for greedy matching
sorted_patterns = sorted(REVERSE_LEET_MAP.keys(), key=lambda x: -len(x))

# === Load the appropriate Bloom Filter ===
def load_filter(prefix):
    path = os.path.join(FILTER_DIR, f"bloom_{prefix}.pkl")
    if os.path.exists(path):
        with open(path, "rb") as f:
            return pickle.load(f)
    return None

# === Generate Leetspeak Variants ===
def generate_leetspeak_variants(password, max_variants=MAX_VARIANTS):
    options = []

    for char in password:
        replacements = LEET_MULTI_MAP.get(char, [])
        options.append(replacements + [char])

    return islice((''.join(chars) for chars in product(*options)), max_variants)

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


def check_password_in_bloom(password):
    hash_hex = hashlib.sha256(password.encode()).hexdigest()
    prefix = hash_hex[:2]
    bloom = load_filter(prefix)

    if bloom is not None:
        return (hash_hex in bloom), password, prefix
    return False, password, None



# === Main Password Check Pipeline ===
def check_password_exist(password):
    # 1. Direct check
    found, match, location = check_password_in_bloom(password)
    if found:
        return True, match, location

    password = password.lower()
    # 2. Normalized variant check (reverse leetspeak)
    normalized_variants = generate_normalized_variants(password)
    for norm in normalized_variants:
        if norm == password:
            continue  # already checked
        found, match, location = check_password_in_bloom(norm)
        if found:
            return True, match, location

    # 3. Leetspeak variants (forward conversion)
    leet_variants = generate_leetspeak_variants(password)
    for leet in leet_variants:
        if leet == password or leet in normalized_variants:
            continue  # already checked
        found, match, location = check_password_in_bloom(leet)
        if found:
            return True, match, location

    return False, None, None


# Main function executor
def leaked_password_detector(password):
    found, variant, filter_idx = check_password_exist(password)
    result = {
        "password":password,
        "status": bool(found),
        "variant": variant if found else None
    }
    return result



def format_l1_result(result):
    status_flag = result.get("status")
    variant = result.get("variant")
    password = result.get("password")
    
    if status_flag:
        result_statement = "Your current password has been found in known data breaches or leaked password databases."
    else:
        result_statement = "Your password has not been found in any known data breaches. It appears to be safe."

    formatted_result = {
        "status": status_flag,
        "variant": variant,
        "statement": result_statement,
        "password":password
    }

    return formatted_result



# if __name__ == "__main__":
#     while True:
#         try:
#             user_input = input("🔐 Enter a password to check (or 'exit'): ")
#             if user_input.lower() == "exit":
#                 break
#             found, variant, filter_idx = check_password_exist(user_input)
#             if found:
#                 print(f"⚠️ Password is compromised! \n Variant: '{variant}' found in filter {filter_idx}\n")
#             else:
#                 print("✅ Password appears safe (no variant matched).\n")
#         except KeyboardInterrupt:
#             break
