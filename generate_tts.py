from gtts import gTTS

# Filipino pronunciation of "aklat"
tts = gTTS("aklat", lang="tl")  # 'tl' is the ISO code for Tagalog/Filipino
tts.save("aklat.mp3")
print("Audio saved as aklat.mp3")
