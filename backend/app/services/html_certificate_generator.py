import base64
import io
import os
from pathlib import Path
from typing import Optional

import jinja2
import qrcode
from pypdf import PdfReader, PdfWriter
from xhtml2pdf import pisa


BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = BASE_DIR / "templates"
ASSETS_DIR = BASE_DIR / "assets" / "templates"

GRADE_BACKGROUND_IMAGES = {
    "A+": ASSETS_DIR / "template_grade_a_plus.png",
    "A": ASSETS_DIR / "template_grade_a.png",
    "B+": ASSETS_DIR / "template_grade_b_plus.png",
    "B": ASSETS_DIR / "template_grade_b.png",
    "C+": ASSETS_DIR / "template_grade_c_plus.png",
    "C": ASSETS_DIR / "template_grade_c.png",
}
GRADE_PDF_TEMPLATES = {
    "A+": ASSETS_DIR / "template_grade_a_plus.pdf",
    "A": ASSETS_DIR / "template_grade_a.pdf",
    "B+": ASSETS_DIR / "template_grade_b_plus.pdf",
    "B": ASSETS_DIR / "template_grade_b.pdf",
    "C+": ASSETS_DIR / "template_grade_c_plus.pdf",
    "C": ASSETS_DIR / "template_grade_c.pdf",
}
DEFAULT_BACKGROUND_IMAGE = ASSETS_DIR / "template_grade_a.png"
DEFAULT_PDF_TEMPLATE = ASSETS_DIR / "template_grade_a.pdf"


def generate_qr_data_uri(qr_url: str) -> str:
    """Generates a sharp PNG QR code and returns it as a base64 Data URI string."""
    qr = qrcode.make(qr_url)
    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"


def resolve_background_image_uri(grade: str) -> str:
    """Resolves background image asset for grade and returns base64 Data URI."""
    grade_clean = (grade or "A").upper().strip()
    img_path = GRADE_BACKGROUND_IMAGES.get(grade_clean, DEFAULT_BACKGROUND_IMAGE)
    if not img_path.exists():
        img_path = DEFAULT_BACKGROUND_IMAGE

    if img_path.exists():
        with open(img_path, "rb") as f:
            b64_data = base64.b64encode(f.read()).decode("utf-8")
            return f"data:image/png;base64,{b64_data}"
    return ""


def generate_certificate_from_html(
    cert_id: str = "PRO-INT-26-839",
    intern_name: str = "MAGHALAKSHMI. P",
    domain: str = "Social Media",
    issue_date: str = "13 SEPTEMBER 2026",
    start_date: str = "March 14, 2026",
    end_date: str = "June 14, 2026",
    duration: str = "3 MONTHS",
    grade: str = "A",
    intern_data: Optional[dict] = None
) -> bytes:
    """
    Renders the Jinja2 HTML certificate template and converts it into a PDF byte stream.
    Merges dynamic overlay with grade background PDF if present.
    """
    if intern_data:
        cert_id = intern_data.get("certificate_id") or intern_data.get("cert_id") or cert_id
        intern_name = intern_data.get("intern_name") or intern_data.get("name") or intern_name
        domain = intern_data.get("domain") or domain
        issue_date = intern_data.get("issue_date") or issue_date
        start_date = intern_data.get("start_date") or start_date
        end_date = intern_data.get("end_date") or end_date
        duration = intern_data.get("duration") or duration
        grade = intern_data.get("grade") or grade

    intern_name_upper = intern_name.upper()
    grade_clean = (grade or "A").upper().strip()
    qr_url = f"https://www.proeduvate.in/verify/{cert_id}"
    qr_data_uri = generate_qr_data_uri(qr_url)
    background_image_path = resolve_background_image_uri(grade_clean)

    # Initialize Jinja2 Environment
    env = jinja2.Environment(
        loader=jinja2.FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=jinja2.select_autoescape(["html", "xml"])
    )
    template = env.get_template("certificate_template.html")

    # Render HTML template with dynamic fields
    rendered_html = template.render(
        intern_name=intern_name_upper,
        domain=domain,
        start_date=start_date,
        end_date=end_date,
        duration=duration,
        cert_id=cert_id,
        issue_date=issue_date.upper(),
        qr_data_uri=qr_data_uri,
        background_image_path=background_image_path
    )

    # Convert HTML to PDF using xhtml2pdf
    pdf_buffer = io.BytesIO()
    pisa_status = pisa.CreatePDF(
        src=rendered_html,
        dest=pdf_buffer,
        encoding="utf-8"
    )

    if pisa_status.err:
        raise RuntimeError(f"xhtml2pdf rendering error: {pisa_status.err}")

    pdf_buffer.seek(0)
    html_pdf_bytes = pdf_buffer.getvalue()

    # Optional: Merge with Grade Background PDF Template if available
    target_template_pdf = GRADE_PDF_TEMPLATES.get(grade_clean, DEFAULT_PDF_TEMPLATE)
    if not target_template_pdf.exists():
        target_template_pdf = DEFAULT_PDF_TEMPLATE

    if target_template_pdf.exists():
        try:
            base_reader = PdfReader(str(target_template_pdf))
            overlay_reader = PdfReader(io.BytesIO(html_pdf_bytes))
            writer = PdfWriter()
            page = base_reader.pages[0]
            page.merge_page(overlay_reader.pages[0])
            writer.add_page(page)

            out_buffer = io.BytesIO()
            writer.write(out_buffer)
            out_buffer.seek(0)
            return out_buffer.getvalue()
        except Exception as e:
            print(f"Template PDF merge fallback warning: {e}")

    return html_pdf_bytes

