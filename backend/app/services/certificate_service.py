import io
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

CURRENT_DIR = Path(__file__).resolve().parent
APP_DIR = CURRENT_DIR.parent
ASSETS_DIR = APP_DIR / "assets"
FONTS_DIR = ASSETS_DIR / "fonts"
TEMPLATES_DIR = ASSETS_DIR / "templates"

TEMPLATE_PATH = TEMPLATES_DIR / "master_template.png"
SIGNATURE_PATH = TEMPLATES_DIR / "ceo_signature_block.png"
SEAL_PATH = TEMPLATES_DIR / "official_seal.png"


def load_font(name: str, size: int):
    font_path = FONTS_DIR / name
    if font_path.exists():
        return ImageFont.truetype(str(font_path), size)
    return ImageFont.load_default()


def text_width(draw: ImageDraw.ImageDraw, text: str, font) -> float:
    return draw.textlength(text, font=font)


def centered_text(draw: ImageDraw.ImageDraw, image_width: int, y: int, text: str, font, fill):
    width = text_width(draw, text, font)
    draw.text(((image_width - width) / 2, y), text, font=font, fill=fill)


def centered_rich_text(draw: ImageDraw.ImageDraw, image_width: int, y: int, parts):
    total = sum(text_width(draw, text, font) for text, font, _ in parts)
    x = (image_width - total) / 2
    for text, font, fill in parts:
        draw.text((x, y), text, font=font, fill=fill)
        x += text_width(draw, text, font)


def ordinal(n: int) -> str:
    if 10 <= n % 100 <= 20:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return f"{n}{suffix}"


def format_date(s: str) -> str:
    if not s:
        return ""
    for fmt in ("%Y-%m-%d", "%d %B %Y", "%B %d, %Y", "%d/%m/%Y", "%d %b %Y"):
        try:
            dt = datetime.strptime(s.strip(), fmt)
            return f"{ordinal(dt.day)} {dt.strftime('%B %Y')}"
        except Exception:
            pass
    return s


def fit_font(draw: ImageDraw.ImageDraw, text: str, font_name: str, start_size: int, max_width: int):
    size = start_size
    while size > 9:
        font = load_font(font_name, size)
        if text_width(draw, text, font) <= max_width:
            return font
        size -= 1
    return load_font(font_name, size)


def grade_for_score(score: float) -> str:
    if score >= 85:
        return "A+"
    if score >= 75:
        return "A"
    if score >= 65:
        return "B+"
    if score >= 50:
        return "B"
    if score >= 45:
        return "C"
    return "FAIL"


class CertificateService:
    """
    Core Certificate Generation Service engine.
    Uses PIL for high-precision master template dynamic text rendering and ReportLab for A4 Landscape PDF buffer generation.
    """

    @staticmethod
    def calculate_grade(score: float) -> str:
        return grade_for_score(score)

    def generate_certificate_image(
        self,
        intern_name: str,
        domain: str,
        start_date: str = "",
        end_date: str = "",
        grade: str = "",
        score: float = 92.0,
        certificate_id: str = "",
        is_approved: bool = True
    ) -> bytes:
        if score < 45:
            raise ValueError("Score below 45. Certificate will not be generated.")

        if not grade:
            grade = grade_for_score(score)

        if not TEMPLATE_PATH.exists():
            raise FileNotFoundError(f"Master certificate template image not found at: {TEMPLATE_PATH}")

        image = Image.open(TEMPLATE_PATH).convert("RGBA")
        draw = ImageDraw.Draw(image)
        width, height = image.size

        dark = (42, 42, 42, 255)
        blue = (18, 94, 155, 255)

        # 1. Recipient name: exact blank area above the existing blue line.
        name_font = fit_font(draw, intern_name, "Roboto-Bold.ttf", 44, 620)
        centered_text(draw, width, 190, intern_name, name_font, (4, 4, 4, 255))

        # 2. Main certificate sentence
        domain_text = domain.strip()
        prefix = "for successfully completing the "
        suffix = " Training"
        regular = load_font("Roboto-Regular.ttf", 17)
        italic_bold = load_font("Roboto-BoldItalic.ttf", 17)
        total = text_width(draw, prefix, regular) + text_width(draw, domain_text, italic_bold) + text_width(draw, suffix, regular)
        if total > 760:
            regular = fit_font(draw, prefix + domain_text + suffix, "Roboto-Regular.ttf", 17, 760)
            italic_bold = fit_font(draw, domain_text, "Roboto-BoldItalic.ttf", 17, 350)
        centered_rich_text(
            draw,
            width,
            257,
            [
                (prefix, regular, dark),
                (domain_text, italic_bold, dark),
                (suffix, regular, dark),
            ],
        )

        # 3. Dates
        formatted_start = format_date(start_date)
        formatted_end = format_date(end_date)
        if formatted_start and formatted_end:
            dates_str = f"at ProEduvate from {formatted_start} to {formatted_end}."
        elif formatted_start:
            dates_str = f"at ProEduvate starting from {formatted_start}."
        else:
            dates_str = "at ProEduvate."

        centered_text(draw, width, 282, dates_str, fit_font(draw, dates_str, "Roboto-Regular.ttf", 16, 760), dark)

        # 4. Original descriptive paragraph
        paragraph_lines = [
            "During this period, the candidate actively participated in the training sessions and demonstrated dedication",
            f"in learning concepts related to {domain_text}. The candidate has shown good technical",
            "understanding, teamwork, and professional conduct throughout the training duration.",
        ]
        for index, line in enumerate(paragraph_lines):
            font = fit_font(draw, line, "Roboto-Italic.ttf", 11, 720)
            centered_text(draw, width, 311 + index * 18, line, font, dark)

        # 5. Appreciation text
        appreciation = [
            "We appreciate the candidate’s commitment and efforts during the program and wish them success in",
            "their future academic and professional endeavors.",
        ]
        for index, line in enumerate(appreciation):
            font = fit_font(draw, line, "Roboto-Italic.ttf", 11, 720)
            centered_text(draw, width, 367 + index * 17, line, font, dark)

        # 6. Grade/score line
        grade_line = f"Grade: {grade} ({score:g}%)"
        grade_font = load_font("Roboto-Bold.ttf", 13)
        centered_text(draw, width, 404, grade_line, grade_font, blue)

        # 7. Conditional Authorization Overlays (Signature & Seal applied ONLY if approved)
        if is_approved:
            if SEAL_PATH.exists():
                seal = Image.open(SEAL_PATH).convert("RGBA")
                image.alpha_composite(seal, (370, 417))
            if SIGNATURE_PATH.exists():
                signature = Image.open(SIGNATURE_PATH).convert("RGBA")
                image.alpha_composite(signature, (610, 409))

        output = io.BytesIO()
        image.convert("RGB").save(output, format="PNG")
        return output.getvalue()

    def generate_certificate_pdf(
        self,
        intern_name: Any,
        domain: str = "",
        start_date: str = "",
        end_date: str = "",
        grade: str = "",
        score: float = 92.0,
        certificate_id: str = "Certificate",
        is_approved: bool = True,
        include_authorization: Optional[bool] = None
    ) -> bytes:
        if include_authorization is not None:
            is_approved = include_authorization

        if isinstance(intern_name, dict):
            return self.generate_from_dict(intern_name, is_approved=is_approved)

        png_bytes = self.generate_certificate_image(
            intern_name=str(intern_name),
            domain=domain,
            start_date=start_date,
            end_date=end_date,
            grade=grade,
            score=score,
            certificate_id=certificate_id,
            is_approved=is_approved
        )
        png_img = Image.open(io.BytesIO(png_bytes))
        width, height = png_img.size
        output = io.BytesIO()
        pdf = canvas.Canvas(output, pagesize=(width, height))
        pdf.drawImage(ImageReader(io.BytesIO(png_bytes)), 0, 0, width=width, height=height)
        pdf.setTitle(f"ProEduvate Certificate - {certificate_id}")
        pdf.setAuthor("ProEduvate")
        pdf.showPage()
        pdf.save()
        output.seek(0)
        return output.getvalue()

    def generate_from_dict(self, data: Dict[str, Any], is_approved: bool = True) -> bytes:
        score_raw = data.get("score")
        score = float(score_raw) if score_raw is not None else 92.0
        return self.generate_certificate_pdf(
            intern_name=str(data.get("intern_name") or data.get("name") or "").strip(),
            domain=str(data.get("domain") or "").strip(),
            start_date=str(data.get("start_date") or "").strip(),
            end_date=str(data.get("end_date") or "").strip(),
            grade=str(data.get("grade") or "").strip(),
            score=score,
            certificate_id=str(data.get("cert_id") or data.get("certificate_id") or "Certificate").strip(),
            is_approved=is_approved
        )
