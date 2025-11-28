import json
import re
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("API_KEY")
genai.configure(api_key=api_key)

def pii_data_extraction(profile_url):
    prompt = f"""
    You are an information extraction engine. 
    Your task is to read the text content extracted from a user's public profile page 
    (e.g., LinkedIn public profile, portfolio, resume page) and identify all possible 
    personal identifiable information (PII) and user-related keywords.

    Strict Rules:
    1. DO NOT add information that is not explicitly present in the provided text.
    2. DO NOT guess or hallucinate.
    3. Extract only what is found in the profile text.
    4. Normalize results by removing extra spaces and duplicates.
    5. Return output ONLY in valid JSON.

    Extract the following fields:

    {{
    "names": [],
    "emails": [],
    "phone_numbers": [],
    "usernames": [],
    "nicknames": [],
    "locations": [],
    "birth_years": [],
    "education": [],
    "companies": [],
    "job_titles": [],
    "skills": [],
    "interests": []
    }}

    Descriptions:
    - names: full name, first name, last name, aliases.
    - emails: email addresses.
    - phone_numbers: any phone-like numeric patterns.
    - usernames: any profile usernames or handles.
    - nicknames: short forms, abbreviations, initials.
    - locations: cities, states, countries.
    - birth_years: any 4-digit year associated with birth or age.
    - education: institute names, degrees, graduation year.
    - companies: organizations the user has worked in.
    - job_titles: job roles and designations.
    - skills: technical and soft skills.
    - interests: hobbies, topics, domains mentioned.

    After extracting information, return only the JSON object and nothing else.

    PROFILE TEXT BELOW:
    --------------------
    {profile_url}
    --------------------
    """
    
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    content = response.text.strip()
    print(content)
    try:
        json_response = json.loads(content)
        print(json_response)
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
    
    
# pii_data_extraction("https://www.linkedin.com/in/onkar-waghmode-85638125a")