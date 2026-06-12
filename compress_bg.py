import os
from PIL import Image
import glob

# Source folder
src_dir = r"C:\Users\Pc\.gemini\antigravity-ide\brain\b96f2a58-c1c8-4c0a-b60b-7e9a651e9456"
# Target folder
dest_dir = r"g:\antigravity files\KidsMathCalculations\src\assets"

os.makedirs(dest_dir, exist_ok=True)

# List of the files
files = glob.glob(os.path.join(src_dir, "bg_*.png"))

for idx, f in enumerate(files):
    try:
        img = Image.open(f)
        # Convert to RGB (to save as JPEG)
        img = img.convert("RGB")
        
        # Resize if very large (generated are usually 1024x1024, resize to 800x800 is good enough for a game background)
        img = img.resize((800, 800), Image.Resampling.LANCZOS)
        
        # Save as optimized JPEG
        filename = f"bg_random_{idx + 1}.jpg"
        dest_path = os.path.join(dest_dir, filename)
        img.save(dest_path, "JPEG", quality=75, optimize=True)
        print(f"Compressed {f} -> {dest_path}")
    except Exception as e:
        print(f"Error compressing {f}: {e}")
