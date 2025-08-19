from gtts import gTTS
import os
import json
import time

# Create the output directory if it doesn't exist
os.makedirs("public/audio", exist_ok=True)

# Define all Filipino words from the application
word_sets = {
    "Mm": ["mata", "maya", "mangga", "mais", "manok", "mani", "mami", "mesa", "misa"],
    "Ss": ["sabon", "saging", "sako", "sali", "sipa", "siko", "sopas", "sulat", "susi"],
    "Aa": ["aklat", "ahas", "ama", "anak", "anim", "apoy", "araw", "aso", "atis"],
    "Bb": ["baboy", "baka", "baso", "bata", "bibig", "bilog", "bintana", "bola", "bulaklak"],
    "Ii": ["ibon", "ilaw", "ilog", "ilong", "ipis", "ipo-ipo", "isa", "isda", "itlog"],
    "Oo": ["obispo", "otap", "okra", "orasan", "oso", "ospital", "oras", "orasyon", "ostra"]
}

# Flatten the word list
all_words = []
for letter_set, words in word_sets.items():
    all_words.extend(words)

# Remove duplicates if any
all_words = list(set(all_words))

print(f"Generating MP3 files for {len(all_words)} Filipino words...")

# Generate MP3 files for each word
word_audio_map = {}
for i, word in enumerate(all_words):
    try:
        # Create a safe filename
        safe_filename = word.replace("-", "_").lower()
        output_path = f"public/audio/{safe_filename}.mp3"
        
        # Skip if file already exists
        if os.path.exists(output_path):
            print(f"[{i+1}/{len(all_words)}] {word} - Already exists, skipping")
            word_audio_map[word] = f"/audio/{safe_filename}.mp3"
            continue
        
        # Generate TTS
        tts = gTTS(word, lang="tl")  # 'tl' is the ISO code for Tagalog/Filipino
        tts.save(output_path)
        
        # Add to mapping
        word_audio_map[word] = f"/audio/{safe_filename}.mp3"
        
        print(f"[{i+1}/{len(all_words)}] {word} - Generated successfully")
        
        # Add a small delay to avoid rate limiting
        time.sleep(0.5)
    except Exception as e:
        print(f"Error generating audio for '{word}': {str(e)}")

# Save the word-to-audio mapping as JSON for easy import in the app
with open("public/audio/word_audio_map.json", "w") as f:
    json.dump(word_audio_map, f, indent=2)

print(f"\nGenerated {len(word_audio_map)} audio files")
print("Audio files saved to public/audio/")
print("Word-to-audio mapping saved to public/audio/word_audio_map.json")
