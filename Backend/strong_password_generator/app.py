from zxcvbn import zxcvbn
import json
import ollama
import re

# Load API Key
# load_dotenv()
# api_key = os.getenv("API_KEY")
# genai.configure(api_key=api_key)

# # Initialize Gemini model
# model = genai.GenerativeModel(model_name="gemini-1.5-flash")

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


# # def clean_and_parse_json_response(raw_response):
# #     # Remove ```json and ending ```
# #     if raw_response.strip().startswith("```json"):
# #         raw_response = raw_response.strip()[7:]  # Remove ```json
# #     if raw_response.strip().endswith("```"):
# #         raw_response = raw_response.strip()[:-3]  # Remove ending ```

# #     return json.loads(raw_response.strip())

# # def clean_and_parse_json_response(raw_response):
# #     result = {}
# #     current_key = None
# #     buffer = []

# #     for line in raw_response.splitlines():
# #         line = line.strip()
# #         if not line:
# #             continue

# #         if line.startswith("reasoning_given_password:"):
# #             if current_key and buffer:
# #                 result[current_key] = " ".join(buffer).strip()
# #                 buffer = []
# #             current_key = "reasoning_given_password"
# #             buffer.append(line[len("reasoning_given_password:"):].strip())
# #         elif line.startswith("strong_password:"):
# #             if current_key and buffer:
# #                 result[current_key] = " ".join(buffer).strip()
# #                 buffer = []
# #             current_key = "strong_password"
# #             buffer.append(line[len("strong_password:"):].strip())
# #         elif line.startswith("reasoning_generated_password:"):
# #             if current_key and buffer:
# #                 result[current_key] = " ".join(buffer).strip()
# #                 buffer = []
# #             current_key = "reasoning_generated_password"
# #             buffer.append(line[len("reasoning_generated_password:"):].strip())
# #         else:
# #             buffer.append(line)

# #     if current_key and buffer:
# #         result[current_key] = " ".join(buffer).strip()

# #     return result

# # def clean_and_parse_json_response(raw_response):
# #     result = {}
    
# #     # First, try to find a dict structure inside the raw response
# #     try:
# #         # Try to extract using regex (this works even if it's not pure JSON)
# #         match = re.search(r'\{.*\}', raw_response, re.DOTALL)
# #         if match:
# #             json_like_str = match.group()
# #             parsed = json.loads(json_like_str.replace("'", '"'))  # Replace single quotes with double
# #             return parsed
# #     except Exception as e:
# #         pass  # If fails, fallback to manual parsing below

# #     # Fallback Manual parsing (your older line-by-line way)
# #     current_key = None
# #     buffer = []

# #     for line in raw_response.splitlines():
# #         line = line.strip()
# #         if not line:
# #             continue

# #         if line.startswith("reasoning_given_password:"):
# #             if current_key and buffer:
# #                 result[current_key] = " ".join(buffer).strip()
# #                 buffer = []
# #             current_key = "reasoning_given_password"
# #             buffer.append(line[len("reasoning_given_password:"):].strip())

# #         elif line.startswith("strong_password:"):
# #             if current_key and buffer:
# #                 result[current_key] = " ".join(buffer).strip()
# #                 buffer = []
# #             current_key = "strong_password"
# #             buffer.append(line[len("strong_password:"):].strip())

# #         elif line.startswith("reasoning_generated_password:"):
# #             if current_key and buffer:
# #                 result[current_key] = " ".join(buffer).strip()
# #                 buffer = []
# #             current_key = "reasoning_generated_password"
# #             buffer.append(line[len("reasoning_generated_password:"):].strip())

# #         else:
# #             buffer.append(line)

# #     if current_key and buffer:
# #         result[current_key] = " ".join(buffer).strip()

# #     return result

# def clean_and_parse_json_response(raw_response):
#     # raw_response is ONLY content, example:
#     # ```json { "reasoning_given_password": "...", "strong_password": "...", "reasoning_generated_password": "..." } ```
    
#     # Remove escaped characters
#     raw_response = raw_response.replace("\\n", "\n").replace("\\'", "'").replace('\\"', '"')
    
#     # Extract the JSON block inside ```json ... ```
#     json_block_match = re.search(r"```json\s*(\{.*?\})\s*```", raw_response, re.DOTALL)
#     if not json_block_match:
#         raise ValueError("No JSON block found inside content.")

#     json_str = json_block_match.group(1)

#     # Parse the JSON
#     parsed_json = json.loads(json_str)

#     return parsed_json

# # Generate strong password using Gemini
# def generate_strong_password(weak_password):
#     weaknesses, entropy, feedback = analyze_password(weak_password)
#     weaknesses_text = "\n".join(f"- {w}" for w in weaknesses) if weaknesses else "No major weaknesses found."

#     feedback_suggestions = feedback.get("suggestions", [])
#     feedback_warning = feedback.get("warning", "")
#     feedback_text = (
#         (f"Warning: {feedback_warning}\n" if feedback_warning else "") +
#         "\n".join(f"- {s}" for s in feedback_suggestions)
#     ).strip()

#     prompt = f"""
#         You are a security expert helping users strengthen their passwords using NIST guidelines.

#         Here is the analysis of a weak password:
#         Password: "{weak_password}"
#         Entropy: {round(entropy, 2)}

#         Identified Weaknesses:
#         {weaknesses_text}

#         Zxcvbn Feedback:
#         {feedback_text if feedback_text else "No feedback"}

#         ## Your task:
#         - Improve the password while keeping its original idea.
#         - Avoid dictionary words, predictable patterns, and weak structures.
#         - Ensure it includes uppercase, lowercase, digits, and special characters.
#         - Ensure a uniform distribution of these character sets to increase the unpredictability of your password. 
#         - Create a password that is both **strong** and **memorable**.
#         - Return the generated strong password and reasoning also using the zxcvbn result that provided to use.
#         - Reasoning : The detailed weaknesses of given password and how it vulnerable in details.
#         - In given passowrd reasoning reasoning do not mention zxcvbn. 
#         - Reasoning for newely generated password : how it is strong and how it prevent from vulnerabilities and how it is better than previous.

#         ## Output should be in json

#         ## Ouput format : 
#             reasoning_given_password : 
#             strong_password : 
#             reasoning_generated_password : 
#         """

#     response = ollama.chat(model='mistral', messages=[{'role': 'user', 'content': prompt}])
#     print("response : \n")
#     print(response)
#     formated_response = clean_and_parse_json_response(response['message']['content'].strip())
#     print("Formated Response : \n")
#     print(formated_response)
#     return formated_response

# generate_strong_password("aditya2323")


import json
import re

def generate_strong_password(weak_password):
    weaknesses, entropy, feedback = analyze_password(weak_password)
    weaknesses_text = "\n".join(f"- {w}" for w in weaknesses) if weaknesses else "No major weaknesses found."

    if entropy > 15:
        return {
                    "reasoning_given_password": "Your password is already strong.",
                    "strong_password": weak_password,
                    "reasoning_generated_password": "Your password is already strong."
                }

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
        - Ensure a uniform distribution of these character sets to increase the unpredictability of the password so that add diverse range of character set. 
        - Create a password that is both **strong** and **memorable**.
        - Return the generated strong password and reasoning also using the zxcvbn result that provided to use.
        - Reasoning : The detailed weaknesses of given password and how it vulnerable in details.
        - In given passowrd reasoning reasoning do not mention zxcvbn. 
        - Vulnerable attacks that can be broke the given password.
        - Reasoning for newely generated password : how it is strong and how it prevent from vulnerabilities and how it is better than previous.

        ## Output must be in JSON format exactly as shown below:
        {{
            "reasoning_given_password": "detailed analysis of weaknesses",
            "strong_password": "generated_strong_password",
            "reasoning_generated_password": "detailed explanation of improvements"
            "attacks":"list out the attacks can be crack the password"
        }}

        Important: Only output the JSON object, nothing else.
        """

    response = ollama.chat(model='mistral', messages=[{'role': 'user', 'content': prompt}])
    # print("response : \n")
    # print(response)
    
    # Extract JSON from response
    content = response['message']['content'].strip()
    
    # Try to find JSON in the response
    try:
        # First try to parse directly
        json_response = json.loads(content)
    except json.JSONDecodeError:
        # If direct parsing fails, try to extract JSON from the text
        try:
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                json_response = json.loads(json_match.group())
            else:
                raise ValueError("No JSON found in response")
        except Exception as e:
            print(f"Failed to parse response: {e}")
            print(f"Original response: {content}")
            # Fallback to manual extraction if automatic fails
            json_response = {
                "reasoning_given_password": "Failed to parse response",
                "strong_password": weak_password + "!1Aa",  # Simple fallback
                "reasoning_generated_password": "Automatic parsing failed, using fallback password"
            }
    
    # print("Formatted Response : \n")
    # print(json_response)
    return json_response


# print(generate_strong_password("4df9#OnWk@%02mfDi234S"))