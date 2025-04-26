from flask import Flask, request, jsonify
from zxcvbn import zxcvbn
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Leetspeak mapping
LEETSPEAK_MAP = {
    '4': 'a', '@': 'a', '8': 'b', '3': 'e', '6': 'g',
    '9': 'g', '1': 'i', '0': 'o', '5': 's', '7': 't',
    '2': 'z', '$': 's', '!': 'i', '#': 'h', '†': 't',
    '√': 'v'
}

def normalize_text(text):
    """Convert alphabetic characters to lowercase"""
    if not isinstance(text, str):
        text = str(text)
    return ''.join([c.lower() if c.isalpha() else c for c in text])

def reverse_leetspeak(password):
    """Convert leetspeak characters to their letter equivalents"""
    return ''.join([LEETSPEAK_MAP.get(c, c) for c in password])

def generate_substrings(text, min_len=2):
    """Generate all possible substrings (length >= min_len)"""
    n = len(text)
    return {text[i:j] for i in range(n) for j in range(i+min_len, n+1)}

def process_pii_data(pii_data):
    """Process PII data into search terms with special handling"""
    pii_terms = []
    
    # Standard fields processing
    for key, value in pii_data.items():
        if not value or str(value).lower() == 'none':
            continue
        
        normalized_value = normalize_text(value)
        
        # Special handling for Birthday
        if key == 'Birthday':
            date_str = normalized_value
            for sep in ['-', '/', ' ']:
                if sep in date_str:
                    pii_terms.extend(date_str.split(sep))
                    pii_terms.append(date_str.replace(sep, ''))
                    try:
                        date_obj = datetime.strptime(date_str, f'%m{sep}%d{sep}%Y')
                        pii_terms.append(date_obj.strftime('%Y%m%d'))
                        pii_terms.append(date_obj.strftime('%d%m%Y'))
                    except:
                        pass
                    break
        
        # Special handling for CountryFull
        elif key == 'CountryFull':
            words = normalized_value.split()
            pii_terms.extend(words)
            initials = ''.join([word[0] for word in words if word])
            if initials:
                pii_terms.append(initials)
        
        # All other fields
        else:
            terms = normalized_value.split()
            pii_terms.extend(terms)
            pii_terms.append(normalized_value)
    
    return list(set([term for term in pii_terms if term]))

def analyze_pii(data):
    try:
        password = data.get('password')
        pii_data = data.get('pii_data', {})
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        # Process PII data
        pii_terms = process_pii_data(pii_data)
        
        # Normalize password and generate variants
        normalized_password = normalize_text(password)
        reverse_leet_password = reverse_leetspeak(normalized_password)
        
        # Generate all substrings to check (from both variants)
        substrings_to_check = (
            generate_substrings(normalized_password) | 
            generate_substrings(reverse_leet_password)
        )
        
        matched_patterns = set()
        
        # Check each substring against PII terms
        for substring in substrings_to_check:
            # Check with zxcvbn
            result = zxcvbn(substring, user_inputs=pii_terms)
            for match in result.get('sequence', []):
                if 'matched_word' in match and match['matched_word'] in pii_terms:
                    matched_patterns.add(match['matched_word'])
            
            # Direct check
            if substring in pii_terms:
                matched_patterns.add(substring)
        
        return jsonify({
            'status': 'matched' if matched_patterns else 'not-matched',
            'matched_patterns': list(matched_patterns),
            'password_variants': {
                'normalized': normalized_password,
                'reverse_leet': reverse_leet_password,
                'substrings_checked': len(substrings_to_check)
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
