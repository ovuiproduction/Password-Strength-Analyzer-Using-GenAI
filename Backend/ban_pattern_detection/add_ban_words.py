import os
import pickle

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
output_folder = f"{CURRENT_DIR}\\ban_words_collection"

def create_indexed_banned_words_pkl(banned_words):
    # Create the folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)

    # Count existing .pkl files to determine next index
    existing_files = [f for f in os.listdir(output_folder) if f.startswith("banned_words_") and f.endswith(".pkl")]
    next_index = len(existing_files) + 1
    output_pkl_path = os.path.join(output_folder, f"banned_words_{next_index}.pkl")

    # Save to new .pkl file
    with open(output_pkl_path, "wb") as f:
        pickle.dump(banned_words, f)

    print(f"✅ Created: {output_pkl_path} with {len(banned_words)} words.")

# create_indexed_banned_words_pkl(new_words, output_folder)
