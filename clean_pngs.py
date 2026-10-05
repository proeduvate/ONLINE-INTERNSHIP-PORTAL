import os
from PIL import Image, ImageDraw

TEMPLATES_DIR = os.path.join("backend", "app", "assets", "templates")
grades = ["a_plus", "a", "b_plus", "b", "c_plus", "c"]

for grade in grades:
    filenames = [
        f"template_grade_{grade}.png",
        f"template_grade_{grade.replace('_plus', 'plus')}.png"
    ]
    for fname in filenames:
        fpath = os.path.join(TEMPLATES_DIR, fname)
        if os.path.exists(fpath):
            img = Image.open(fpath).convert("RGB")
            draw = ImageDraw.Draw(img)
            w, h = img.size

            bg_recipient = (253, 253, 253)
            bg_body = (240, 248, 255)  # AliceBlue matching body container
            bg_details = (254, 254, 254)

            # 1. Erase 'STUDENT NAME' (y ~ 0.36*h to 0.43*h)
            draw.rectangle([w * 0.18, h * 0.36, w * 0.82, h * 0.43], fill=bg_recipient)

            # 2. Erase narrative paragraph (y ~ 0.44*h to 0.63*h) across full body container width
            draw.rectangle([w * 0.04, h * 0.44, w * 0.96, h * 0.63], fill=bg_body)

            # 3. Erase details table values row by row (x from 0.19*w to 0.415*w)
            # Row 1 (INTERN NAME)
            draw.rectangle([w * 0.19, h * 0.730, w * 0.415, h * 0.765], fill=bg_details)
            # Row 2 (INTERNSHIP DOMAIN)
            draw.rectangle([w * 0.19, h * 0.770, w * 0.415, h * 0.802], fill=bg_details)
            # Row 3 (DURATION OF PARTICIPATION)
            draw.rectangle([w * 0.19, h * 0.808, w * 0.415, h * 0.840], fill=bg_details)
            # Row 4 (MODE)
            draw.rectangle([w * 0.19, h * 0.846, w * 0.415, h * 0.878], fill=bg_details)
            # Row 5 (CERTIFICATE ID)
            draw.rectangle([w * 0.19, h * 0.884, w * 0.415, h * 0.916], fill=bg_details)

            # 4. Erase old bottom right DATE OF ISSUE line outside
            draw.rectangle([w * 0.70, h * 0.935, w * 0.98, h * 0.975], fill=bg_details)

            img.save(fpath, "PNG")

            # Save clean PDF template counterpart
            pdf_path = fpath.rsplit(".", 1)[0] + ".pdf"
            img.save(pdf_path, "PDF")
            print(f"Cleaned {fname} and updated {os.path.basename(pdf_path)}")