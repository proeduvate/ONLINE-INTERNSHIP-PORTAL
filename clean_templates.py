import os
from PIL import Image, ImageDraw

TEMPLATES_DIR = os.path.join("backend", "app", "assets", "templates")
grades = ["a_plus", "a", "b_plus", "b", "c_plus", "c"]
white = (255, 255, 255, 255)

for grade in grades:
    for fname in [f"template_grade_{grade}.png", f"template_grade_{grade.replace('_plus', 'plus')}.png"]:
        fpath = os.path.join(TEMPLATES_DIR, fname)
        if os.path.exists(fpath):
            img = Image.open(fpath).convert("RGBA")
            draw = ImageDraw.Draw(img)
            w, h = img.size

            # 1. Erase 'STUDENT NAME'
            draw.rectangle([w * 0.25, h * 0.35, w * 0.75, h * 0.44], fill=white)

            # 2. Erase the sample narrative paragraph
            draw.rectangle([w * 0.05, h * 0.44, w * 0.95, h * 0.68], fill=white)

            # 3. Erase details box text values (preserves 'INTERN NAME:', etc.)
            draw.rectangle([w * 0.23, h * 0.72, w * 0.43, h * 0.94], fill=white)

            img.save(fpath, "PNG")
            print(f"[OK] Cleaned: {fname}")
