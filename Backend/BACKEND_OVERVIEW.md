# Backend Architecture & Module Overview

## 🏗️ System Architecture

The backend is a modular Flask application that orchestrates 6+ independent password evaluation layers, each exposing its own REST endpoints and helper functions. The main `app.py` acts as a router and aggregator.

---

## 📁 Backend Directory Structure & Modules

### `Backend/app.py` (Main Flask Application)
**Purpose:** Core REST API server, user authentication, session management, and layer orchestration.

**Key Components:**
- JWT authentication (`/signup`, `/login`, `/reset-password`, `/check_password_expiry`)
- Multi-layer password validation (`/validate-password`, `/validate-password-user`)
- Per-layer endpoints (breach detection, pattern analysis, composition, crack-time, generation)
- Bulk CSV validation with multithreading (`/validate-bulk-password`)
- Admin control endpoints (`/update-expire-time`, `/upadte-ban-word-list`, `/update-time-fallback`, `/update-ps-conditions`)
- Audio analysis endpoints (`/deepfake-detection`)
- PII analysis (`/analyze-pii`)
- User-requested password generation (`/user-req-generate`)

**Imports & Dependencies:**
```
Flask, flask-cors, python-dotenv, bcrypt, flask-pymongo, flask-jwt-extended, 
bson, zxcvbn, pandas, torch, torchaudio, pydub, speechbrain, numpy, re, io
```

**Database Collections:**
- `users` — User accounts, hashed passwords, reuse hashes, password analysis reports
- `history` — Password reset history with reuse hashes to prevent reuse

---

### `Backend/leaked_password_detection/`
**Purpose:** Layer 1 — Check if passwords exist in known breached datasets.

**Files:**
- `app.py` — Main module with bloom filter lookups and variant generation
- `bloom_filters/` — 256 pickle files (`bloom_00.pkl` to `bloom_ff.pkl`) containing pre-built Bloom filters for fast O(1) breach lookups

**Key Functions:**
- `leaked_password_detector(password)` — Check password and common variants against Bloom filters
- `format_l1_result(result)` — Format breach detection results

**Imports & Dependencies:**
```
hashlib, pickle, os, itertools
```

---

### `Backend/ban_pattern_detection/`
**Purpose:** Layer 2 — Detect banned words, PII patterns, leet-speak variations, and weak sequences.

**Files:**
- `app.py` — Pattern detection logic using zxcvbn and custom dictionaries
- `add_ban_words.py` — Utility to create indexed banned-word pickle files
- `ban_words_collection/` — Pickled banned-word dictionaries (`banned_words_1.pkl` to `banned_words_6.pkl`)

**Key Functions:**
- `ban_words_identification(password)` — Detect banned patterns, fuzzy matches, PII
- `analyze_password_variants_zxcvbn(password)` — Analyze leet-speak and keyboard variations
- `format_l2_result(result)` — Format pattern detection results
- `create_indexed_banned_words_pkl(banned_words)` — Add new banned words at runtime

**Imports & Dependencies:**
```
zxcvbn, pickle, os, pathlib
```

---

### `Backend/composition_check/`
**Purpose:** Layer 3 — Analyze password composition using zxcvbn + ML models with SHAP explainability.

**Files:**
- `app.py` — Feature extraction and model predictions with SHAP explanations
- `models/` — Pre-trained ML models:
  - `random_forest_model.pkl` — Random Forest regressor for password strength
  - `preprocessor.pkl` — Scikit-learn StandardScaler for feature normalization
- `data_generation/` — Data preparation scripts for training
- `train_models/` — Model training pipeline (Random Forest + XGBoost)

**Key Functions:**
- `password_strength_meter(password)` — Extract 15+ features and predict strength with SHAP values
- `extract_features(password)` — Compute entropy, character diversity, pattern counts
- `format_l3_result(result)` — Format composition results with SHAP impact scores

**Imports & Dependencies:**
```
re, numpy, pandas, joblib, zxcvbn, shap, pathlib, 
sklearn (preprocessing, pipeline, ensemble), xgboost, matplotlib, seaborn
```

---

### `Backend/crack_time_estimator/`
**Purpose:** Layer 4 — Estimate how long it would take to crack a password using hash cracking tools.

**Files:**
- `app.py` — Wrapper around John the Ripper and zxcvbn for crack-time estimation
- `password.txt`, `weak_password.txt` — Sample password lists for testing

**Key Functions:**
- `estimate_crack_time_for_password(password, timeout)` — Run John the Ripper and zxcvbn to estimate crack time
- `detect_hash_type(hash_str)` — Identify hash format (MD5, SHA1, SHA256, bcrypt, etc.)
- `run_john_command(command, timeout)` — Execute John the Ripper with timeout
- `format_l4_result(result)` — Format crack-time results

**Imports & Dependencies:**
```
subprocess, time, re, hashlib, tempfile, os, json, zxcvbn
```

---

### `Backend/composition_check/data_generation/`
**Purpose:** Generate training data for composition strength models using RockYou dataset.

**Files:**
- `data_set_formation.py` — Extract features from passwords and generate `password_strength_dataset.csv`

**Key Functions:**
- `load_passwords(filepath, limit)` — Load password file
- `calculate_features(password)` — Compute 15+ password features (entropy, ratios, character types)
- `assign_labels(scores_dict)` — Label passwords as weak/medium/strong

**Imports & Dependencies:**
```
pandas, re, math, collections, zxcvbn
```

---

### `Backend/composition_check/train_models/`
**Purpose:** Train Random Forest and XGBoost models on generated dataset.

**Files:**
- `app.py` — Model training and evaluation pipeline

**Key Functions:**
- Model training with Random Forest Regressor and XGBoost
- Pipeline with StandardScaler normalization
- RMSE and R² evaluation
- Model serialization to pickle files

**Imports & Dependencies:**
```
pandas, numpy, matplotlib, seaborn, sklearn, xgboost, pickle
```

---

### `Backend/deepfake_audio_detection/`
**Purpose:** Layer 6 — Detect synthetic/deepfake audio and analyze speaker characteristics.

**Files:**
- `app.py` — Audio feature extraction and deepfake detection
- `my_model.h5` — Pre-trained TensorFlow/Keras CNN model for audio classification
- `Test/` — Sample audio files (`fake_audio.mp3`, `OriginalAudio.wav`, `OriginalAudio-2.wav`)

**Key Functions:**
- `analyze_audio(uploaded_file)` — Extract MFCC features and predict deepfake likelihood
- `extract_features_from_audio(audio_bytes, max_length, sr, n_mfcc)` — Extract MFCC from audio
- `load_model()` — Load pre-trained Keras model

**Imports & Dependencies:**
```
numpy, librosa, tensorflow, io
```

---

### `Backend/strong_password_generator/`
**Purpose:** Layer 5 — Generate strong passwords using LLMs with contextual improvement.

**Files:**
- `app_gemini.py` — Google Gemini API integration for password generation
- `app_mistral.py` — Mistral LLM integration (alternative)

**Key Functions:**
- `generate_strong_password_using_gemini(weak_password)` — Analyze weaknesses and generate improved password
- `analyze_password(password)` — Use zxcvbn to identify weaknesses
- `format_l5_result(result)` — Format generation results

**Imports & Dependencies:**
```
google.generativeai, zxcvbn, os, dotenv, json, re, ollama
```

---

### `Backend/user_based_password/`
**Purpose:** Generate passwords based on user-specific requirements and constraints.

**Files:**
- `app_gemini.py` — Gemini-based user-request-driven generation
- `app_mistral.py` — Mistral-based alternative

**Key Functions:**
- `generate_strong_user_req_password(weak_password, user_requirement)` — Generate password per user's request
  - Example requests: "make it longer", "avoid numbers", "add special chars", etc.

**Imports & Dependencies:**
```
json, re, os, google.generativeai, ollama
```

---

### `Backend/PII_detector/`
**Purpose:** Standalone PII detection module to identify personal data in passwords.

**Files:**
- `app.py` — Flask micro-app for PII analysis

**Key Functions:**
- `analyze_pii(pii_data)` — Check password against provided PII (name, email, DOB, etc.)
- `process_pii_data(pii_data)` — Normalize and process PII input
- `reverse_leetspeak(password)` — Decode leet-speak for matching
- `generate_substrings(text, min_len)` — Generate substring candidates

**Imports & Dependencies:**
```
flask, zxcvbn, datetime, flask_cors
```

---

### `Backend/ban_pattern_detection/add_ban_words.py`
**Purpose:** Utility script to create and append banned-word lists to pickle files.

**Key Functions:**
- `create_indexed_banned_words_pkl(banned_words)` — Serialize and save banned-word lists with auto-incrementing indices

**Imports & Dependencies:**
```
os, pickle
```

---

## 🔌 API Endpoints Summary

### User & Auth
- `POST /signup` — Register new user
- `POST /login` — Login and receive JWT
- `POST /reset-password` — Change password with reuse checks
- `GET /check_password_expiry` — Check password expiry/warning status

### Single Password Analysis (Per-Layer)
- `POST /leaked-password-detection` — Layer 1 only
- `POST /pattern-analysis` — Layer 2 only
- `POST /composition-analysis` — Layer 3 only
- `POST /crack-password` — Layer 4 only
- `POST /generate-strong-password` — Layer 5 only

### Aggregated Analysis
- `POST /validate-password` — Run all layers (non-authenticated)
- `POST /validate-password-user` — Run all layers + cache to user record

### Advanced Features
- `POST /validate-bulk-password` — Upload CSV for batch validation
- `GET /download/<id>` — Download validation results CSV
- `POST /deepfake-detection` — Audio deepfake analysis
- `POST /analyze-pii` — PII-based weakness detection
- `POST /user-req-generate` — User-customized password generation

### Admin
- `POST /update-expire-time` — Set password expiry days
- `POST /upadte-ban-word-list` — Update banned-word list
- `POST /update-time-fallback` — Update crack-time fallback timeout
- `POST /update-ps-conditions` — Update password composition constraints

---

## 🔐 Data Flow

1. **User submits password** → `app.py` receives request
2. **Authentication** (if required) → JWT verification
3. **Layer Evaluation** → Calls each module:
   - Leaked Password Detection (Bloom filter lookup)
   - Pattern Detection (Banned words, PII, leet-speak)
   - Composition Analysis (zxcvbn + ML model + SHAP)
   - Crack-time Estimation (John the Ripper + entropy)
   - Strong Password Generation (LLM-based suggestion)
4. **Aggregation** → Combine layer results
5. **Response** → JSON with per-layer findings and overall strength score
6. **Storage** (if user is authenticated) → Cache result to MongoDB

---

## 📊 Key Libraries & Their Roles

| Library | Role | Usage |
|---------|------|-------|
| **Flask** | Web framework | REST API server |
| **flask-jwt-extended** | Authentication | JWT tokens for sessions |
| **flask-pymongo** | DB connection | MongoDB integration |
| **bcrypt** | Password hashing | Secure storage |
| **zxcvbn** | Password analysis | Pattern & entropy scoring |
| **pandas** | Data processing | CSV handling, dataset creation |
| **numpy** | Numerical computation | Feature extraction |
| **scikit-learn** | ML preprocessing | Feature normalization |
| **shap** | Model explainability | Feature impact attribution |
| **joblib** | Model serialization | Load/save ML models |
| **google-generativeai** | LLM integration | Gemini API for generation |
| **ollama** | LLM integration | Mistral local/remote access |
| **torch, torchaudio** | Deep learning | Audio processing & speech models |
| **speechbrain** | Speaker recognition | Deepfake & speaker verification |
| **librosa** | Audio feature extraction | MFCC computation |
| **tensorflow** | Deep learning | Load Keras audio model |
| **pydub** | Audio conversion | WAV/MP3/WEBM support |
| **python-dotenv** | Environment config | Load .env variables |

---


## 🔄 Module Interdependencies

```
app.py (Main orchestrator)
  ├─ leaked_password_detection/app.py
  ├─ ban_pattern_detection/app.py
  │  └─ ban_pattern_detection/add_ban_words.py
  ├─ composition_check/app.py
  │  └─ composition_check/models/ (pickled models)
  ├─ crack_time_estimator/app.py
  ├─ strong_password_generator/app_gemini.py
  ├─ user_based_password/app_gemini.py
  ├─ PII_detector/app.py
  └─ deepfake_audio_detection/app.py
```

---

## 📝 Notes

- **Models:** Random Forest and XGBoost trained on RockYou dataset with 15+ features.
- **Bloom Filters:** 256 filters for distributed breach lookup (O(1) average lookup time).
- **LLM Agents:** Gemini 2.0 Flash and Mistral provide contextual suggestions and generation.
- **Audio:** Supports WAV, MP3, and browser WEBM (auto-converted).
- **Multithreading:** Bulk validation uses ThreadPoolExecutor for parallel processing.
- **Expiry & History:** MongoDB-backed user password history to prevent reuse.

