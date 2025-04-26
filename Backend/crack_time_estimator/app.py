import subprocess
import time
import re
import hashlib
import tempfile
import os
import json
from zxcvbn import zxcvbn

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# [MD5, SHA1, SHA256, Bcrypt]
def detect_hash_type(hash_str):
    if re.fullmatch(r'[a-f0-9]{32}', hash_str, re.IGNORECASE):
        return "raw-md5"
    elif re.fullmatch(r'[a-f0-9]{40}', hash_str, re.IGNORECASE):
        return "raw-sha1"
    elif re.fullmatch(r'[a-f0-9]{64}', hash_str, re.IGNORECASE):
        return "raw-sha256"
    elif hash_str.startswith("$1$"):
        return "md5crypt"
    elif hash_str.startswith("$5$"):
        return "sha256crypt"
    elif hash_str.startswith("$6$"):
        return "sha512crypt"
    elif hash_str.startswith("$2a$") or hash_str.startswith("$2b$") or hash_str.startswith("$2y$"):
        return "bcrypt"
    else:
        return None

def run_john_command(command, timeout):
    try:
        process = subprocess.Popen(command)
        process.wait(timeout=timeout)
        return True
    except subprocess.TimeoutExpired:
        process.terminate()
        return False

def parse_cracked_password(john_path, hash_file, hash_format):
    try:
        result = subprocess.check_output(
            [john_path, "--show", hash_file, f"--format={hash_format}"],
            text=True
        )
        for line in result.strip().splitlines():
            if ":" in line and not line.startswith("0 password hashes cracked"):
                return line.split(":")[1].strip()
    except subprocess.CalledProcessError:
        return None
    return None

def crack_hash(hash_value, plaintext_password, john_path, wordlist_file, timeout):
    hash_format = detect_hash_type(hash_value)
    if not hash_format:
        return {
            "status": "failed",
            "reason": "Unknown hash format",
            "hash_format": None
        }

    with tempfile.NamedTemporaryFile(mode="w+", delete=False) as f:
        f.write(hash_value + "\n")
        temp_hash_file = f.name

    try:
        # --- Try 1: Wordlist + Rules ---
        command = [
            john_path,
            temp_hash_file,
            f"--wordlist={wordlist_file}",
            f"--format={hash_format}",
            "--rules"
        ]
        start_time = time.time()
        success = run_john_command(command, timeout)
        crack_time = round(time.time() - start_time, 2)

        cracked = parse_cracked_password(john_path, temp_hash_file, hash_format)
        if cracked:
            return {
                "status": "cracked",
                "method": "wordlist+rules",
                "cracked_password": cracked,
                "crack_time_seconds": crack_time,
                "estimated_time_to_crack": crack_time,
                "detailed_crack_time":{},
                "fallback_used": False,
                "hash_format": hash_format
            }

        # --- Try 2: Incremental ---
        # command = [
        #     john_path,
        #     temp_hash_file,
        #     f"--format={hash_format}",
        #     "--incremental"
        # ]
        # start_time = time.time()
        # success = run_john_command(command, timeout)
        # crack_time = round(time.time() - start_time, 2)

        # cracked = parse_cracked_password(john_path, temp_hash_file, hash_format)
        
        # if cracked:
        #     return {
        #         "status": "cracked",
        #         "method": "incremental",
        #         "cracked_password": cracked,
        #         "crack_time_seconds": crack_time,
        #         "estimated_time_to_crack": crack_time,
        #         "detailed_crack_time":{},
        #         "fallback_used": False,
        #         "hash_format": hash_format
        #     }

        # --- Fallback: zxcvbn ---
        zxcvbn_result = zxcvbn(plaintext_password)
        estimated_time = float(zxcvbn_result['crack_times_seconds']['offline_fast_hashing_1e10_per_second'])
        
        detailed_crack_time = {}
        for key, value in zxcvbn_result['crack_times_seconds'].items():
            time_in_seconds = float(value)
            if time_in_seconds >= 86400:  # 1 day = 86400 seconds
                time_in_days = time_in_seconds / 86400
                formatted_time = f"{time_in_days:.2f} days"
            else:
                formatted_time = f"{time_in_seconds:.2f} sec"
            detailed_crack_time[key] = formatted_time
        
        return {
            "status": "not_cracked",
            "method": "timeout",
            "crack_time_seconds": None,
            "estimated_time_to_crack": estimated_time,
            "detailed_crack_time":detailed_crack_time,
            "fallback_used": True,
            "hash_format": hash_format,
            "message": "Crack engine failed to crack within time. Fallback estimation used."
        }

    finally:
        os.remove(temp_hash_file)

# ---- Main API-Style Wrapper ----
def estimate_crack_time_for_password(password_plaintext,timeout):
    john_exe_path = r"C:\john-1.9.0-jumbo-1-win64\run\john.exe"
    wordlist_file = f"{CURRENT_DIR}\\weak_password.txt"
    
    # Hash the password
    md5_hash = hashlib.md5(password_plaintext.encode()).hexdigest()
    sha256_hash = hashlib.sha256(password_plaintext.encode()).hexdigest()

    results = {
        "input_password": password_plaintext,
        "md5_hash_result": crack_hash(md5_hash, password_plaintext, john_exe_path, wordlist_file, timeout),
        "sha256_hash_result": crack_hash(sha256_hash, password_plaintext, john_exe_path, wordlist_file, timeout)
    }
    return results


# print(estimate_crack_time_for_password("password@123",10))