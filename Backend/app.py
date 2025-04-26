from flask import Flask,request,jsonify
import os
from dotenv import load_dotenv
import google.generativeai as genai
from flask_cors import CORS
import time
import bcrypt
import hashlib
from flask_pymongo import PyMongo
from datetime import datetime, timezone ,timedelta
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from bson import ObjectId
from zxcvbn import zxcvbn
import pandas as pd
from flask import send_from_directory
from concurrent.futures import ThreadPoolExecutor

load_dotenv()


# imports
from leaked_password_detection.app import leaked_password_detector
from ban_pattern_detection.app import ban_words_identification
from composition_check.app import password_strength_generator
from crack_time_estimator.app import estimate_crack_time_for_password
from strong_password_generator.app import generate_strong_password
from ban_pattern_detection.app import analyze_password_variants_zxcvbn
from PII_detector.app import analyze_pii

# Admin imports
from ban_pattern_detection.add_ban_words import create_indexed_banned_words_pkl


#flask app
app = Flask(__name__)
CORS(app)

app.secret_key = os.urandom(24)
jwt = JWTManager(app)

app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)

app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

# gemini configuration
API_KEY = os.getenv("API_KEY")
genai.configure(api_key = API_KEY)
geminimodel = genai.GenerativeModel("gemini-1.5-flash")

PORT = os.getenv("PORT")

users_collection = mongo.db.users  
history_collection = mongo.db.history


# root route
@app.route('/')
def index():
    return jsonify(f"Server running on {PORT}")



# Variables

PASSWORD_EXPIRY_DAYS = 30
PASSWORD_TIMEOUT = 15

PASSWORD_CONSTRAINTS = {
    "length": {"min": 12},                   # Minimum 8 characters
    "entropy": {"min": 15},                 # Minimum entropy threshold
    "shannon_entropy": {"min": 2.5},         # Shannon entropy minimum
    "num_unique_chars": {"min": 5},          # At least 5 unique characters
    "unique_char_ratio": {"min": 0.5},       # At least 50% unique characters
    "has_upper_lower": {"required": True},   # Should have both uppercase and lowercase
    "digit_ratio": {"min": 0.1},             # At least 10% digits
    "special_ratio": {"min": 0.1},           # At least 10% special characters
    "upper_case_ratio": {"min": 0.1},         # Minimum 10% uppercase
    "lower_case_ratio": {"min": 0.1},         # Minimum 10% lowercase
    "num_repeated_chars": {"max": 2},         # Maximum 2 repeated chars allowed
    "dictionary_match_count": {"max": 1}      # Maximum 1 dictionary match
}


#### Functions for user

# Generate JWT Token
def generate_token(user_id):
    return create_access_token(identity=user_id)

def calculate_reuse_hash(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


#### Functions for Admin

def update_password_expiry_days(new_days):
    global PASSWORD_EXPIRY_DAYS
    PASSWORD_EXPIRY_DAYS = new_days

def update_ban_words_list(banned_words):
    create_indexed_banned_words_pkl(banned_words)

def update_time_to_fallback(new_time_out):
    global PASSWORD_TIMEOUT
    PASSWORD_TIMEOUT = new_time_out

def update_password_composition_constraints(new_constraints):
    global PASSWORD_CONSTRAINTS
    PASSWORD_CONSTRAINTS.update(new_constraints)
    return True

### Format layer results

def format_l1_result(result):
    status_flag = result.get("status")
    variant = result.get("variant")
    
    if status_flag:
        result_statement = "Your current password has been found in known data breaches or leaked password databases."
    else:
        result_statement = "Your password has not been found in any known data breaches. It appears to be safe."

    formatted_result = {
        "status": status_flag,
        "variant": variant,
        "statement": result_statement
    }

    return formatted_result

def format_l2_result(result):
    def filter_patterns(patterns):
        return [
            {
                "pattern": p.get("pattern"),
                "dictionary_name": p.get("dictionary_name"),
                "matched_word": p.get("matched_word")
            }
            for p in patterns
            if isinstance(p.get("matched_word"), str) and len(p.get("matched_word", "")) >= 3
        ]

    def format_password_result(data):
        filtered_patterns = filter_patterns(data.get("patterns", []))
        return {
            "status": bool(filtered_patterns),
            "patterns": filtered_patterns,
            "warning": data.get("warning", ""),
            "suggestions": data.get("suggestions", [])
        }

    original = result.get("original_password_analysis", {})
    normalized = result.get("normalized_password_analysis", {})
    is_weaker = result.get("normalized_is_weaker", False)

    original_formatted = format_password_result(original)
    formatted_result = {
        "original_password_result": original_formatted,
        "normalized_is_weaker": is_weaker
    }

    if is_weaker:
        normalized_formatted = format_password_result(normalized)
        formatted_result["normalized_password_result"] = normalized_formatted
        formatted_result["explain"] = (
            f"The normalized password is considered weaker because it has a lower strength score "
            f"({normalized.get('score', 0)}) compared to the original ({original.get('score', 0)}), "
            f"and a lower entropy ({normalized.get('entropy', 0.0)} vs {original.get('entropy', 0.0)}), "
            f"making it more susceptible to guessing attacks."
        )
        # Include status from normalized as well if present
        final_status = original_formatted["status"] or normalized_formatted["status"]
    else:
        final_status = original_formatted["status"]

    formatted_result["status"] = final_status

    return formatted_result

def format_l3_result(result):
    features = result.get("features", {})
    shap_impact = result.get("shap_impact", {})
    score = round(result.get("score", 0), 2)

    relevant_feature_keys = PASSWORD_CONSTRAINTS.keys()

    # Filter relevant features and add score
    filtered_features = {
        key: features.get(key, 0)
        for key in relevant_feature_keys
        if key in features
    }
    filtered_features["score"] = score

    # Check constraints
    status = False
    failed_conditions = []

    for key, conditions in PASSWORD_CONSTRAINTS.items():
        feature_value = features.get(key, 0)

        for condition_type, condition_value in conditions.items():
            if condition_type == "min" and feature_value < condition_value:
                status = True
                failed_conditions.append({
                    "feature": key,
                    "expected": f"min {condition_value}",
                    "actual": feature_value
                })
            if condition_type == "max" and feature_value > condition_value:
                status = True
                failed_conditions.append({
                    "feature": key,
                    "expected": f"max {condition_value}",
                    "actual": feature_value
                })
            if condition_type == "required" and not feature_value:
                status = True
                failed_conditions.append({
                    "feature": key,
                    "expected": "required True",
                    "actual": feature_value
                })

    strength = "Strong" if status else "Weak"

    if score == 0 : status = True

    formatted_result = {
        "score":score,
        "features": filtered_features,
        "shap_impact": shap_impact,
        "strength": strength,
        "status": status,
        "failed_conditions": failed_conditions
    }

    return formatted_result

def format_l4_result(result):
    md5_result = result.get("md5_hash_result", {})
    sha256_result = result.get("sha256_hash_result", {})
    
    # Determine overall status
    is_cracked = (
        md5_result.get("status") == "cracked" or 
        sha256_result.get("status") == "cracked"
    )

    # Construct result statement
    if is_cracked:
        cracked_algos = []
        if md5_result.get("status") == "cracked":
            cracked_algos.append("MD5")
        if sha256_result.get("status") == "cracked":
            cracked_algos.append("SHA256")
        result_statement = (
            f"The password was cracked using {', '.join(cracked_algos)} hash algorithm(s), "
            f"indicating it is vulnerable to offline dictionary attacks. "
            "Consider choosing a stronger password with higher entropy."
        )
    else:
        result_statement = (
            "The password could not be cracked using MD5 or SHA256 hashes within the given constraints. "
            "This suggests a reasonable level of resistance against common hash-cracking methods."
        )

    formatted_result = {
        "md5_hash_result": md5_result,
        "sha256_hash_result": sha256_result,
        "status": is_cracked,
        "result_statement": result_statement
    }

    return formatted_result

def format_5_result(result):
    return{
        "result":result,
        "status":False
    }

def is_password_expired(current_user):
    # Fetch user from database
    user = users_collection.find_one({"_id": ObjectId(current_user)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Get password update timestamp
    updated_at = user.get("updated_at")
    if not updated_at:
        return jsonify({"error": "Password update timestamp not found"}), 404

    # Ensure `updated_at` is timezone-aware in UTC
    if updated_at.tzinfo is None:
        updated_at = updated_at.replace(tzinfo=timezone.utc)  # Convert to aware datetime
    else:
        updated_at = updated_at.astimezone(timezone.utc)  # Convert to UTC if in another timezone

    # Get current time as timezone-aware datetime in UTC
    current_time = datetime.now(timezone.utc)

    # Calculate time difference
    time_diff = current_time - updated_at

    # Check expiry thresholds
    if time_diff.days > PASSWORD_EXPIRY_DAYS:
        return jsonify({"status":"expired","alert": "Your password has expired. Please change it."}), 200
    elif time_diff.days > (PASSWORD_EXPIRY_DAYS - 5):
        return jsonify({"status":"warning","alert": "Your password is about to expire. Please change it soon."}), 200

    return jsonify({"status":"safe","alert": f"Your password is within valid duration. Expire after {PASSWORD_EXPIRY_DAYS-time_diff.days} days"}), 200

def validate_password(password):
    result = {}
    
    # Layer 1: Leaked Password Detection
    layer1_raw_res = leaked_password_detector(password)
    layer1_res = format_l1_result(layer1_raw_res)
    result["Leaked-Password-Detection"] = layer1_res

    # Layer 2: Banned Words / Weak Patterns
    layer2_raw_res = ban_words_identification(password)
    layer2_res = format_l2_result(layer2_raw_res)
    result["Banned-Words-Detection"] = layer2_res

    # Layer 3: Password Strength
    layer3_raw_res = password_strength_generator(password)
    layer3_res = format_l3_result(layer3_raw_res)
    result["Strength-Analysis"] = layer3_res

    # Layer 4: Crack Time Estimation
    layer4_raw_res = estimate_crack_time_for_password(password,PASSWORD_TIMEOUT)
    layer4_res = format_l4_result(layer4_raw_res)
    result["Crack-Time-Estimation"] = layer4_res

    # Layer 5: password generation
    layer5_raw = generate_strong_password(password)
    layer5_res = format_5_result(layer5_raw)
    result["Strong-Password"] = layer5_res
   
    # Final status & vulnerable layers
    vulnerable_layers = []
    for layer_name, layer_data in result.items():
        if layer_data.get("status"):
            vulnerable_layers.append(layer_name)

    result["status"] = bool(vulnerable_layers)
    result["vulnerable_layers"] = vulnerable_layers

    return result


def format_l4_single_result(password):
    zxcvbn_result = zxcvbn(password)
    estimated_time_fast_hashing = float(zxcvbn_result['crack_times_seconds']['offline_fast_hashing_1e10_per_second'])
    estimated_time_slow_hashing = float(zxcvbn_result['crack_times_seconds']['offline_slow_hashing_1e4_per_second'])
    status = True if estimated_time_fast_hashing > 3600 and estimated_time_slow_hashing > 3600 else False
    formatted_result = {
        "estimated_time_fast_hashing": estimated_time_fast_hashing,
        "estimated_time_slow_hashing":estimated_time_slow_hashing,
        "status":status
    }
    return formatted_result




#### Routes  user 

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            return jsonify({"error": "Email is already taken"}), 400
        
        reuse_hash = calculate_reuse_hash(password)

        reused_password = users_collection.find_one({"reuse_hash": reuse_hash})
        if reused_password:
            return jsonify({"error": "This password has already been used by another account"}), 400
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user_data = {
            "email": email,
            "hashed_password": hashed_password.decode('utf-8'),
            "reuse_hash": reuse_hash,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        insert_result = users_collection.insert_one(user_data)
        user_id = str(insert_result.inserted_id)  # ✅ Convert ObjectId to string here
        
        history_collection.insert_one({
            "user_id": insert_result.inserted_id,  # Keep as ObjectId for MongoDB reference
            "reuse_hash": reuse_hash,
            "created_at": datetime.now(timezone.utc)
        })
        
        token = generate_token(user_id)  # Now passing a string
        return jsonify({
            "message": "User signed up successfully",
            "token": token
        }), 201
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/reset-password', methods=['POST'])
@jwt_required()
def reset_password():
    data = request.json
    new_password = data.get("new_password")
    current_password = data.get("current_password")
    current_user = get_jwt_identity() 
    
    if not current_password or not new_password:
        return jsonify({"error": "current password and new password are required"}), 400

    # Step 1: Find the user
    user = users_collection.find_one({"_id": ObjectId(current_user)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    user_id = user["_id"]
    reuse_hash = calculate_reuse_hash(new_password)

    stored_hashed_password = user["hashed_password"]

    if not bcrypt.checkpw(current_password.encode(), stored_hashed_password.encode()):
        return jsonify({"error": "Invalid current password"}), 401
    
    # Step 2: Check if another user is using the same password
    reused_by_other = users_collection.find_one({
        "_id": {"$ne": user_id},
        "reuse_hash": reuse_hash
    })
    if reused_by_other:
        return jsonify({"status":"warning","error": "This password is already used by another user. Please choose a different one."}), 409


    # Step 3: Check if this password matches any of the last 3 used by this user
    last_3_passwords = history_collection.find(
        {"user_id": user_id},
        sort=[("created_at", -1)]
    ).limit(3)

    for entry in last_3_passwords:
        if entry["reuse_hash"] == reuse_hash:
            return jsonify({"status":"warning","error": "This password matches one of your previously used passwords. Please choose a new and unique password to ensure account security."}), 409

    # Step 4: All checks passed — update password
    new_hashed_password = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt())

    users_collection.update_one(
        {"_id": user_id},
        {
            "$set": {
                "hashed_password": new_hashed_password.decode('utf-8'),
                "reuse_hash": reuse_hash,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    # Step 5: Insert into history
    history_collection.insert_one({
        "user_id": user_id,
        "reuse_hash": reuse_hash,
        "created_at": datetime.now(timezone.utc)
    })

    return jsonify({"status":"success","message": "Password reset successful!"}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    users_collection = mongo.db.users
    user = users_collection.find_one({"email": email})

    if not user:
        return jsonify({"error": "Invalid email address. No user found with the provided email."}), 401

    # Verify password
    stored_hashed_password = user["hashed_password"]
    if not bcrypt.checkpw(password.encode(), stored_hashed_password.encode()):
        return jsonify({"error": "Incorrect password. Please try again."}), 401

    # Update last login timestamp
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )

    # Convert ObjectId to string for JWT and response
    user_id = str(user["_id"])  # ✅ Convert here
    token = create_access_token(identity=user_id)  # Use string ID

    return jsonify({
        "message": "Login successful",
        "user": {
            "email": user["email"],
            "id": user_id 
        },
        "token": token
    }), 200

@app.route('/check_password_expiry', methods=['GET'])
@jwt_required()
def check_password_expiry():
    current_user = get_jwt_identity()
    return is_password_expired(current_user)

@app.route('/validate-password', methods=['POST'])
def scan_password():
    data = request.get_json()

    if not data or 'password' not in data:
        return jsonify({"error": "Missing 'password' field in request body."}), 400

    password = data['password']

    if not isinstance(password, str):
        return jsonify({"error": "Password must be a string."}), 400

    result = validate_password(password)

    return jsonify({"result": result}), 200



# admin routes

@app.route('/update-expire-time', methods=['POST'])
def resetExpireTime():
    data = request.get_json()
    days = data.get("new_days")
    if days is not None:
        update_password_expiry_days(int(days))
        return jsonify({"status": "Reset Expire Days successfully.", "new_days": PASSWORD_EXPIRY_DAYS})
    return jsonify({"error": "Days not provided"}), 400

@app.route('/upadte-ban-word-list', methods=['POST'])
def updateBanWordList():
    data = request.get_json()
    banned_words = data.get("banned_words")
    update_ban_words_list(banned_words)
    return jsonify({"status":"Ban word list updated.."})

@app.route('/update-time-fallback',methods=['POST'])
def updataTimeFallback():
    data = request.get_json()
    fall_back_time = data.get("new_time_out")
    update_time_to_fallback(fall_back_time)
    return jsonify({"status":"Updated fallback time {fall_back_time}."})

@app.route('/update-ps-conditions', methods=['POST'])
def updatePSCondition():
    data = request.get_json()
    constraints = data.get("constraints")
    if not data:
        return jsonify({"error": "No data provided"}), 400
    update_password_composition_constraints(constraints)
    return jsonify({"status": "Password composition constraints updated.."})

#### Password checking layer routes

# Layer 1 [leaked dataset search (HIBP Passwords , 1 koti)]
@app.route('/leaked-password-detection', methods=['POST'])
def leakedPasswordDetector():
    data = request.get_json()

    if not data or 'password' not in data:
        return jsonify({"error": "Missing 'password' field in request"}), 400

    password = data['password']
    
    result = leaked_password_detector(password)
    time.sleep(5)
    return jsonify(result), 200

# Layer 2,3 [Ban Words , Personal Data , keyboard Patterns, Weak Patterns]
@app.route('/pattern-analysis', methods=['POST'])
def patternAnalysis():
    data = request.get_json()
    
    if not data or 'password' not in data:
        return jsonify({"error": "Missing 'password' field in request"}), 400
    
    password = data['password']
    result = ban_words_identification(password)
    time.sleep(5)
    return jsonify(result), 200

# Layer 4,5 [Password Composition and Entropy]
@app.route('/composition-analysis', methods=['POST'])
def compositionAnalysis():
    data = request.get_json()
    
    if not data or 'password' not in data:
        return jsonify({"error": "Missing 'password' field in request"}), 400
    
    password = data['password']
    result = password_strength_generator(password)
    time.sleep(5)
    return jsonify(result), 200

# Layer 6 [Time to crack estimator]
@app.route("/crack-password", methods=["POST"])
def crack_password_time():
    data = request.get_json()
    
    if not data or "password" not in data:
        return jsonify({"error": "Missing 'password' in request body"}), 400

    password = data["password"]
    result = estimate_crack_time_for_password(password,PASSWORD_TIMEOUT)
    return jsonify(result)

# Layer 7 [Strong password generator]
@app.route('/generate-strong-password', methods=['POST'])
def generate_strong_password_api():
    data = request.get_json()
    password = data.get('password')

    if not password:
        return jsonify({"status": "error", "message": "Missing 'weak_password'"}), 400

    try:
        result = generate_strong_password(password)
        return jsonify({
            "status": "success",
            "input_password": password,
            "result": result
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def validate_single_password(password):
    print(password) 
    return analyze_password_variants_zxcvbn(password)


# @app.route('/validate-bulk-password', methods=['POST'])
# def validate_bulk_password():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Step 1: Read uploaded CSV
        df = pd.read_csv(file)

        if 'password' not in df.columns:
            return jsonify({'error': 'CSV must contain a "password" column'}), 400

        # Step 2: Apply password validation
        def validate_or_mark(password):
            if len(str(password)) > 30:
                return "Very Strong"  # Directly mark
            else:
                return validate_single_password(password)  # Otherwise validate normally

        df['status'] = df['password'].apply(validate_or_mark)

        # Step 3: Create a smaller DataFrame
        status_df = df[['password', 'status']]

        # Step 4: Prepare folder and file path
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        output_folder = os.path.join(BASE_DIR, 'output_files')
        
        # ✅ Create output folder if it doesn't exist
        os.makedirs(output_folder, exist_ok=True)  

        output_file_path = os.path.join(output_folder, 'password_status_output.csv') 
        
        # ✅ Save the CSV
        status_df.to_csv(output_file_path, index=False)

        # Step 5: Respond
        return jsonify({
            'message': 'Validation completed successfully!',
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download/<id>', methods=['GET'])
def getFile(id):
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Define the output directory
    output_dir = os.path.join(current_dir, 'output_files')
    
    try:
        # Verify the file exists
        if not os.path.exists(os.path.join(output_dir, 'password_status_output.csv')):
            return jsonify({'error': 'File not found'}), 404
            
        # Send the file for download
        return send_from_directory(
            directory=output_dir,
            path='password_status_output.csv',
            as_attachment=True,
            download_name='password_validation_results.csv'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/validate-bulk-password', methods=['POST'])
# def validate_bulk_password():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file part'}), 400

#     file = request.files['file']

#     if file.filename == '':
#         return jsonify({'error': 'No selected file'}), 400

#     try:
#         # Step 1: Read uploaded CSV
#         df = pd.read_csv(file)

#         if 'password' not in df.columns:
#             return jsonify({'error': 'CSV must contain a "password" column'}), 400

#         # Step 2: Apply password validation
#         def validate_or_mark(password):
#             if len(str(password)) > 30:
#                 return "Very Strong"  # Directly mark
#             else:
#                 return validate_single_password(password)  # Otherwise validate normally

#         df['status'] = df['password'].apply(validate_or_mark)

#         # Step 3: Create output folder
#         BASE_DIR = os.path.dirname(os.path.abspath(__file__))
#         output_folder = os.path.join(BASE_DIR, 'output_files')
#         os.makedirs(output_folder, exist_ok=True)  

#         # Step 4: Save the CSV
#         output_file_path = os.path.join(output_folder, 'password_status_output.csv')
#         df.to_csv(output_file_path, index=False)

#         # Step 5: Convert results to dictionary for JSON response
#         results = df[['password', 'status']].to_dict('records')

#         return jsonify({
#             'message': 'Validation completed successfully!',
#             'outputFile': results[:100],
#             'downloadUrl': 'http://localhost:5000/download/password_status_output.csv'
#         }), 200

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
def validate_bulk_password():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Step 1: Read uploaded CSV
        df = pd.read_csv(file)

        if 'password' not in df.columns:
            return jsonify({'error': 'CSV must contain a "password" column'}), 400

        # Step 2: Apply password validation with multithreading
        def validate_or_mark(password):
            if len(str(password)) > 30:
                return "Very Strong"
            return validate_single_password(password)

        # Convert passwords to list for parallel processing
        passwords = df['password'].tolist()
        
        # Determine optimal number of threads (you can adjust this)
        num_threads = min(32, os.cpu_count() * 4)  # Max 32 threads
        
        # Process passwords in parallel
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            results = list(executor.map(validate_or_mark, passwords))
        
        df['status'] = results

        # Step 3: Create output folder
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        output_folder = os.path.join(BASE_DIR, 'output_files')
        os.makedirs(output_folder, exist_ok=True)  

        # Step 4: Save the CSV
        output_file_path = os.path.join(output_folder, 'password_status_output.csv')
        df.to_csv(output_file_path, index=False)

        # Step 5: Convert results to dictionary for JSON response
        results = df[['password', 'status']].to_dict('records')

        return jsonify({
            'message': 'Validation completed successfully!',
            'outputFile': results[:100],
            'downloadUrl': 'http://localhost:5000/download/password_status_output.csv',
            'stats': {
                'total_passwords': len(df),
                'processed_with_threads': num_threads
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/analyze-pii',methods=['POST'])
def analyzePii():
    data = request.json
    return analyze_pii(data)

# Main runner
if __name__=="__main__":
    app.run(host='0.0.0.0', port=PORT)