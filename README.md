# 🔐 Advanced Password Strength Analyzer

An AI-powered, multi-layered password evaluation and generation system designed to identify vulnerabilities, improve password robustness, and assist users in creating secure yet memorable passwords. It integrates traditional security techniques, statistical analysis, and Generative AI for end-to-end password security enhancement.

<div align="center">

### 🧑 For People  
*It’s like having a personal password coach.*

### 🏢 For Industry  
*It’s a compliance & security enforcement tool.*

</div>


---

## 🎯 Objective

The goal of this system is to **analyze the strength of a password** through **multi-dimensional evaluation layers** and provide **intelligent suggestions** to improve password security. By simulating different types of real-world attacks (e.g., brute force, social engineering, breached databases), it ensures each password undergoes rigorous scrutiny.

---

## 🧠 Technology Stack

- **Frontend:** React.js  
- **Backend:** Flask  
- **Authentication:** JWT (JSON Web Tokens)  
- **Password Hashing & Security:** bcrypt, Bloom filters  
- **Security Models & Logic:** zxcvbn, Entropy calculations  
- **Explainability:** SHAP (SHapley Additive exPlanations)  
- **Generative AI:** Mistral LLM for intelligent feedback and password generation  
- **Data:** Breached datasets like RockYou, LinkedIn leaks

---

## 🔐 Multi-Layered Architecture

This system evaluates passwords across **Six key layers**, each simulating a real-world attack vector or analysis dimension:

---

### 1️⃣ **Breached Password Identification**  
- **Type:** Brute Force Attack Simulation  
- **Approach:** Checks the password against known leaked datasets like RockYou and LinkedIn dumps using Bloom Filters for fast lookup.  
- **Goal:** Prevent the use of passwords that are already publicly exposed.  

---

### 2️⃣ **Banned & Fuzzy Word Detection (PII-Based)**  
- **Type:** Social Engineering Attack Simulation  
- **Approach:** Identifies passwords containing or resembling personal identifiable data (PII) such as names, DOBs, email fragments using fuzzy matching.  
- **Goal:** Detect predictable or easily guessable patterns related to user identity.

---

### 3️⃣ **Password Composition Strength Analysis**  
- **Type:** Pure Brute Force Simulation  
- **Approach:** Analyzes structure based on character types (uppercase, lowercase, digits, symbols), repetition patterns, keyboard adjacency, and dictionary patterns using **zxcvbn**.  
- **Goal:** Evaluate complexity against generic brute-force attacks.

---

### 4️⃣ **Entropy Calculation & Crack Time Estimation**  
- **Approach:** Calculates Shannon entropy and uses combinatorial logic to estimate crack time against common attack strategies.  
- **Goal:** Quantify randomness and evaluate resilience to password cracking tools.

---

### 5️⃣ **GenAI-Based Password Strength Feedback and Generation**  
- **Approach:**  
  - Uses **Mistral LLM** to generate strong passwords tailored to security requirements.
  - Interactively updates password based on user queries (e.g., "make it easier to remember", "add a special character", "use a word I like").  
- **Goal:** Achieve a balance between security, unpredictability, and user memorability.

---

## 💬 AI-Powered Feedback Loop

Each layer provides:
- **Scoring**
- **Risk Explanation using SHAP**
- **Actionable Suggestions from LLM**

The system returns an **aggregated strength score**, visual feedback, and intelligent suggestions that adapt based on specific vulnerabilities detected in each layer.

---

## 🔄 Password Generation System

- Users can **query the LLM** to generate passwords that:
  - Avoid banned patterns
  - Match complexity standards
  - Are easier to remember while maintaining entropy
- Includes **interactive update system** that lets users modify generated passwords (e.g., change structure, add memorable phrases).

---
## 🎙️ Audio-Based Password Verification
- Users can enroll audio as a password
- System verifies the speaker and audio password
- Detects deepfake audio

---

## 🧪 Features Overview
| Feature                             | Description                                                                 |
|-------------------------------------|-----------------------------------------------------------------------------|
| **Password Strength Analysis**         | Layered evaluation using breached data, PII check, zxcvbn, entropy, and LLM |
| **Leak Detection**                     | Breach dataset lookup with Bloom filters                                   |
| **Pattern Analysis**                   | Detects predictable or weak sequences                                      |
| **Entropy Check**                       | Measures cryptographic randomness                                          |
| **SHAP Explainability**                 | Interprets feature impact for each password                                |
| **Dictionary Matching**                 | Compares with common words and passwords                                   |
| **PII Detection**                       | Detects use of name, email, DOB patterns                                   |
| **Strong Password Generator**           | GenAI-driven custom password creation                                      |
| **Crack Time Estimation**               | Estimates how long a password would take to crack                          |
| **Bulk Password Validation**           | For enterprise-wide audits                                                 |
| **Password Expiration Alerts**         | Notifies users of outdated passwords                                       |
| **Password History Check**             | Prevents reuse of recent passwords                                         |
| **Admin Control Panel**                | Configure organizational security policies                                 |
| **Enterprise Password Uniqueness**     | Ensures password uniqueness across teams                                   |
| **Audio-based password workflows**    |  Audio based password verification with deepfake analysis |
| **AI Feedback**                         | Explains weaknesses and gives personalized suggestions                     |

---

## 🧰 Skills & Technologies Used

- **Artificial Intelligence (AI)**
- **Machine Learning**
- **Bloom Filters**
- **zxcvbn Password Analysis**
- **Large Language Models (LLM) – Mistral**
- **SHAP (Explainability)**
- **bcrypt for Hashing**
- **JWT (JSON Web Tokens)**
- **React.js (Frontend)**
- **Flask (Backend)**
- **SpeechBrain Library (Speaker verification)**
- **AssemblyAI API (Audio Transcription)**
- **CNN & BiLSTM (Deepfake Detection)**

---

## 📌 Use Cases

- **Developers:** Integrate into login systems or password checkers.
- **Enterprises:** Conduct audits, enforce password policies, and detect weak credentials.
- **Users:** Get real-time feedback and generate secure, personalized passwords.
- **Security Auditors:** Perform breach checks and pattern evaluations at scale.
---


## 🗂️ Project Structure

```text
Password-Strength-Analysis-Using-GenAI/
│
├── Backend/
│   ├── app.py
│   ├── ban_pattern_detection/
│   │   ├── app.py
│   │   ├── add_ban_words.py
│   │   └── ban_words_collection/
│   │       └── banned_words_1.pkl ... banned_words_6.pkl
│   │       
│   ├── composition_check/
│   │   ├── app.py
│   │   ├── models/
│   │   │   ├── preprocessor.pkl
│   │   │   └── random_forest_model.pkl
│   │   ├── data_generation (Data prepared for training model (Rockyou-weak password data))
│   │   │      └── app.py
│   │   └── train_models
│   │         └── app.py
│   │
│   ├── crack_time_estimator/
│   │   ├── app.py
│   │   ├── password.txt
│   │   └── weak_password.txt
│   │   
│   ├── deepfake_audio_detection/
│   │   ├── app.py
│   │   ├── my_model.h5
│   │   └── Test/
│   │       ├── fake_audio.mp3
│   │       ├── OriginalAudio.wav
│   │       └── OriginalAudio-2.wav
│   │   
│   ├── leaked_password_detection/
│   │   ├── app.py
│   │   └── bloom_filters/
│   │       ├── bloom_00.pkl ... bloom_ff.pkl
│   │       └── ReadMe.md
│   │   
│   ├── PII_detector/
│   │   └── app.py
│   │   
│   ├── strong_password_generator/
│   │   ├── app_gemini.py
│   │   └── app_mistral.py
│   │   
│   └── user_based_password/
│       ├── app_gemini.py
│       └── app_mistral.py
│      
│
├── Frontend/
│   ├── package.json
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── ... (icons, manifest)
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── components/
│       │   ├── AdminControlPanel.jsx
│       │   ├── AuthModal.jsx
│       │   ├── BreachDetection.jsx
│       │   ├── ... (other components)
│       ├── css/
│       │   ├── Dashboard.css
│       │   ├── ... (other styles)
│       ├── images/
│       │   └── logo.png
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── PasswordAnalysis.jsx
│       │   ├── ... (other pages)
│       └── styles/
│           ├── BreachDetection.css
│           ├── ... (other feature styles)
│
├── LICENSE
├── README.md

```

---


## 🛠 Installation & Setup

Follow these steps to get both backend and frontend running locally. Commands below assume you're on Windows using `bash.exe` (Git Bash / WSL). Adjust package manager commands for your OS as needed.

### 0) Git Clone
1. open terminal and type
```bash
git clone https://github.com/ovuiproduction/Password-Strength-Analyzer-Using-GenAI
```

### Prerequisites
- Python 3.10+ (recommend 3.11)
- Node.js 18+ and npm or yarn
- MongoDB (local or managed)
- ffmpeg (for audio processing)
- Git

If you plan to run deepfake/audio features or use certain ML models, you may also need a working C/C++ build toolchain (MSVC on Windows or build-essential on Linux) and sufficient RAM/GPU support for model inference.

### 1) Backend — create virtual environment & install
1. Open a bash shell in the `Backend/` folder.

```bash
cd Backend
# create virtual environment (venv)
python -m venv .venv

```

2. Install Python dependencies from `requirements.txt` (file included in `Backend/`):

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

If you don't have `requirements.txt`, install these core packages (approx):

```bash
pip install flask flask-cors python-dotenv pymongo bcrypt flask-jwt-extended pandas numpy scikit-learn xgboost joblib shap zxcvbn-python librosa pydub tensorflow torch soundfile
```

Note: some packages (e.g., `librosa`, `pydub`, `ffmpeg`, `SpeechBrain`) require system libraries. Install `ffmpeg` separately (see below).

### 2) Frontend & Backend — environment variables
1. Rename Backend/.env.example to Backend/.env
2. Fill that with actual keys
3. Rename Frontend/.env.example to Frontend/.env
4. Fill that with actual keys

### 3) Frontend — install & run
1. From the project root open a bash shell and change to `Frontend/`:

```bash
cd Frontend
npm install
# or: yarn install
```

2. Start the frontend dev server:

```bash
npm start
# or: yarn start
```

The app will typically run at `http://localhost:3000`.

### 4) Run the backend

#### Setup Backend
**Open each folder in backend and follow the instructions given to run backend as expected**

```bash
# if app.py has an app.run guard you can run:
python app.py

```

API endpoints are available at `http://localhost:5000` by default.

### 5) All dependencies (summary)
This project uses a number of Python and system dependencies. Key packages:

- Flask, flask-cors, python-dotenv
- pymongo
- bcrypt
- flask-jwt-extended
- pandas, numpy
- scikit-learn, xgboost, joblib
- shap
- zxcvbn-python
- librosa, soundfile, pydub, ffmpeg (audio)
- tensorflow and/or torch (models)
- SpeechBrain (speaker verification)
- jsPDF, recharts, axios, react, react-router (frontend packages in `package.json`)

Install system packages as required (ffmpeg, sox) via your OS package manager. Example (WSL / Ubuntu):

```bash
sudo apt update && sudo apt install -y ffmpeg sox build-essential git
```

### 6) Installing John the Ripper (recommended for crack-time estimations)
John the Ripper (JTR) provides more realistic crack time estimations. On Windows you have two recommended options:

- Option A — Use WSL (recommended):

```bash
# in WSL (Ubuntu):
sudo apt update
sudo apt install -y john
# verify
john --version
```

- Option B — Prebuilt Windows binaries (jumbo):
  1. Download a precompiled `john` (Jumbo) from Openwall or a trusted release page.
  2. Unzip and add the `john` executable directory to your PATH or set `JTR_PATH` in `.env`.

When `JTR_PATH` is provided, the backend will call the binary for crack-time estimation where implemented.

### 7) Gemini API key (Google Generative AI)
1. Create or obtain an API key for the Gemini (Google Generative) API following Google's docs.
2. Add the key to your `.env` as `GEMINI_API_KEY`.
3. Example usage in backend code (`Backend/strong_password_generator/app_gemini.py`):

```py
import os
from google.generativeai import client

API_KEY = os.getenv("GEMINI_API_KEY")
client.configure(api_key=API_KEY)
# then call the client to create completions
```


### 8) Audio & Deepfake features
- Install `ffmpeg` and ensure `FFMPEG_PATH` or `ffmpeg` is available on PATH.
- Install `librosa`, `soundfile`, and `pydub` into the Python environment.
- For speaker verification use `SpeechBrain` and any pretrained models.
- For `SpeechBrain` hugging face authentication required

### 9) MongoDB
- Install MongoDB 
- Create database with name`password_security`
- update backend/.env

### 10) Quick run checklist
1. Start MongoDB
2. Activate backend venv and install requirements
3. Set `.env` variables
4. Start backend: `python Backend/app.py` or `python app.py`
5. Start frontend: `cd Frontend && npm start`

### 11) Troubleshooting tips
- If audio packages fail to install, ensure `ffmpeg` and system build tools are installed.
- If a library throws missing header errors, install your OS C build tools (e.g., `build-essential` on Debian/Ubuntu or MSVC on Windows).
- For permission problems on Windows, try running from WSL or an elevated shell.

---


## License 

This project is licensed under the [MIT License](https://github.com/ovuiproduction/Password-Strength-Analyzer-Using-GenAI/blob/main/LICENSE)
