# Use this if you want to use Mistral model from Ollama instead of Gemini

# import json
# import ollama
# import re

# def generate_strong_user_req_password(weak_password,user_requirement):
    
#     prompt = f"""
#         You are a security expert helping users strengthen their passwords using NIST guidelines.
#         ## generate the password based on user requirement.
#         ## given password : {weak_password}
#         ## user requireent : {user_requirement}
#         ## Your task:
#         - Improve the password while keeping its original idea.
#         - Avoid dictionary words, predictable patterns, and weak structures.
#         - Ensure it includes uppercase, lowercase, digits, and special characters.
#         - Ensure a uniform distribution of these character sets to increase the unpredictability of the password so that add diverse range of character set. 
#         - Create a password that is both **strong** and **memorable**.
#         - **Generate a strong password that meets the user requirements**.
#         - Return the generated strong password only no any explanation of strong password.
        

#         ## Output must be in JSON format exactly as shown below:
#         {{
#             "strong_password": "generated_strong_password",
#         }}

#         Important: Only output the JSON object, nothing else.
#         """

#     response = ollama.chat(model='mistral', messages=[{'role': 'user', 'content': prompt}])
#     content = response['message']['content'].strip()
    
#     # Try to find JSON in the response
#     try:
#         # First try to parse directly
#         json_response = json.loads(content)
#     except json.JSONDecodeError:
#         # If direct parsing fails, try to extract JSON from the text
#         try:
#             json_match = re.search(r'\{.*\}', content, re.DOTALL)
#             if json_match:
#                 json_response = json.loads(json_match.group())
#             else:
#                 raise ValueError("No JSON found in response")
#         except Exception as e:
#             print(f"Failed to parse response: {e}")
#             print(f"Original response: {content}")
#             # Fallback to manual extraction if automatic fails
#             json_response = {
#                 "strong_password": weak_password + "!1Aa",
#             }

#     return json_response
