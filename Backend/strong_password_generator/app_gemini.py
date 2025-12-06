import google.generativeai as genai
from zxcvbn import zxcvbn
import os
from dotenv import load_dotenv
import json

# make sure to set the GEMINI_API_KEY in your .env file


# Load API Key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Initialize Gemini model
model = genai.GenerativeModel(model_name="gemini-2.0-flash")

# Analyze password
def analyze_password(password):
    result = zxcvbn(password)
    weaknesses = []

    for match in result['sequence']:
        pattern = match['pattern']
        token = match.get('token', '')
        description = ""

        if pattern == 'dictionary':
            description = f"'{token}' is a common dictionary word"
        elif pattern == 'repeat':
            description = f"'{token}' has repeated characters"
        elif pattern == 'sequence':
            description = f"'{token}' is a predictable sequence"
        elif pattern == 'regex':
            description = f"'{token}' matches a common regex pattern"
        elif pattern == 'date':
            description = f"'{token}' looks like a date"
        elif pattern == 'bruteforce':
            description = f"'{token}' is susceptible to brute-force attacks"
        elif pattern == 'spatial':
            description = f"'{token}' follows a keyboard pattern"
        elif pattern == 'l33t':
            description = f"'{token}' uses leetspeak (1337 substitutions)"

        if description:
            weaknesses.append(description)

    if result['score'] < 3:
        weaknesses.append("Password has low entropy")
    if not any(char in password for char in "!@#$%^&*()_+-=[]{}|;':\",.<>?/"):
        weaknesses.append("Missing special characters")

    return weaknesses, result['guesses_log10'], result.get('feedback', {})

def clean_and_parse_json_response(raw_response):
    # Remove ```json and ending ```
    if raw_response.strip().startswith("```json"):
        raw_response = raw_response.strip()[7:]  # Remove ```json
    if raw_response.strip().endswith("```"):
        raw_response = raw_response.strip()[:-3]  # Remove ending ```

    return json.loads(raw_response.strip())

# Generate strong password using Gemini
def generate_strong_password_using_gemini(weak_password):
    weaknesses, entropy, feedback = analyze_password(weak_password)
    weaknesses_text = "\n".join(f"- {w}" for w in weaknesses) if weaknesses else "No major weaknesses found."

    feedback_suggestions = feedback.get("suggestions", [])
    feedback_warning = feedback.get("warning", "")
    feedback_text = (
        (f"Warning: {feedback_warning}\n" if feedback_warning else "") +
        "\n".join(f"- {s}" for s in feedback_suggestions)
    ).strip()

    prompt = f"""
        You are a security expert helping users strengthen their passwords using NIST guidelines.

        Here is the analysis of a weak password:
        Password: "{weak_password}"
        Entropy: {round(entropy, 2)}

        Identified Weaknesses:
        {weaknesses_text}

        Zxcvbn Feedback:
        {feedback_text if feedback_text else "No feedback"}

        ## Your task:
        - Improve the password while keeping its original idea.
        - Avoid dictionary words, predictable patterns, and weak structures.
        - Ensure it includes uppercase, lowercase, digits, and special characters.
        - Ensure a uniform distribution of these character sets to increase the unpredictability of your password. 
        - Create a password that is both **strong** and **memorable**.
        - Return the generated strong password and reasoning also using the zxcvbn result that provided to use.
        - Reasoning : The detailed weaknesses of given password and how it vulnerable in details.
        - attacks : List of possible attacks that can be done on given password.
        - In given passowrd reasoning reasoning do not mention zxcvbn. 
        - Reasoning for newely generated password : how it is strong and how it prevent from vulnerabilities and how it is better than previous.
        
        ## Ouput should be in json format
        
        ## Ouput format : 
            reasoning_given_password : 
            attacks : 
            strong_password : 
            reasoning_generated_password : 
        """

    response = model.generate_content(prompt)
    # print("Raw response from Gemini:", response.text.strip())
    return clean_and_parse_json_response(response.text.strip())


def format_l5_result(result):
    return{
        "result":result,
        "status":False
    }