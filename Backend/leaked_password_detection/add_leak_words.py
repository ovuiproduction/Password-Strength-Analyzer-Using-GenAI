import os
import pickle


# first download the txt file from
# https://github.com/danielmiessler/SecLists/tree/master/Passwords
# use rockyou, linkedin, common-passwords etc
# store in ban_words folder
# then run this script to create pkl files


def create_indexed_banned_words_pkl(txt_path, output_folder):
    # Create the folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)

    # Count existing .pkl files to determine next index
    existing_files = [f for f in os.listdir(output_folder) if f.startswith("banned_words_") and f.endswith(".pkl")]
    next_index = len(existing_files) + 1
    output_pkl_path = os.path.join(output_folder, f"banned_words_{next_index}.pkl")

    # Load new banned words from txt
    banned_words = set()
    with open(txt_path, 'r', encoding='utf-8', errors='ignore') as file:
        for line in file:
            word = line.strip().lower()
            if word:
                banned_words.add(word)

    # Save to new .pkl file
    with open(output_pkl_path, "wb") as f:
        pickle.dump(banned_words, f)

    print(f"✅ Created: {output_pkl_path} with {len(banned_words)} words.")

# === USAGE ===
txt_file = "./ban_words/rockyou.txt"
output_folder = "ban_words_collection"

create_indexed_banned_words_pkl(txt_file, output_folder)
