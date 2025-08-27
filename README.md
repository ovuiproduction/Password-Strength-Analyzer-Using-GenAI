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

This system evaluates passwords across **five key layers**, each simulating a real-world attack vector or analysis dimension:

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

---

## 📌 Use Cases

- **Developers:** Integrate into login systems or password checkers.
- **Enterprises:** Conduct audits, enforce password policies, and detect weak credentials.
- **Users:** Get real-time feedback and generate secure, personalized passwords.
- **Security Auditors:** Perform breach checks and pattern evaluations at scale.
---

## License 
This project is licensed under the [MIT License](https://github.com/ovuiproduction/Password-Strength-Analyzer-Using-GenAI/blob/main/LICENSE)
