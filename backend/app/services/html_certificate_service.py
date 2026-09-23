import base64
import io
import os
from pathlib import Path
from typing import Dict, Any, Optional

import jinja2
import qrcode
from PIL import Image


# Determine base directories using pathlib.Path
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

TEMPLATES_DIR = BASE_DIR / "templates"
if not TEMPLATES_DIR.exists():
    TEMPLATES_DIR = PROJECT_ROOT / "templates"

ASSETS_DIR = BASE_DIR / "assets" / "templates"
if not ASSETS_DIR.exists():
    ASSETS_DIR = PROJECT_ROOT / "backend" / "app" / "assets" / "templates"


def calculate_grade(score: float) -> str:
    """Calculates letter grade based on numeric score."""
    val = float(score) if score is not None else 0.0
    if val >= 90:
        return "A+"
    elif val >= 80:
        return "A"
    elif val >= 70:
        return "B+"
    elif val >= 60:
        return "B"
    elif val >= 50:
        return "C+"
    else:
        return "C"


def resolve_background_image_data_uri(grade: str) -> str:
    """
    Resolves background template PNG for letter grade and encodes it as Base64 Data URI.
    Points to official grade templates in backend/app/assets/templates/.
    """
    grade_clean = (grade or "A").upper().strip()
    filename_map = {
        "A+": ["template_grade_a_plus.png"],
        "A": ["template_grade_a.png"],
        "B+": ["template_grade_b_plus.png"],
        "B": ["template_grade_b.png"],
        "C+": ["template_grade_c_plus.png"],
        "C": ["template_grade_c.png"],
    }
    
    candidates = filename_map.get(grade_clean, ["template_grade_a.png"])

    target_file = None
    for filename in candidates:
        possible_path = ASSETS_DIR / filename
        if possible_path.exists():
            target_file = possible_path
            break
            
    if not target_file or not target_file.exists():
        fallback_path = ASSETS_DIR / "template_grade_a.png"
        if fallback_path.exists():
            target_file = fallback_path

    if target_file and target_file.exists():
        with open(target_file, "rb") as f:
            b64_data = base64.b64encode(f.read()).decode("utf-8")
            return f"data:image/png;base64,{b64_data}"
    return ""       
    return ""


def generate_qr_code_data_uri(cert_id: str) -> str:
    """
    Generates a verification QR code pointing to https://www.proeduvate.in/verify/{cert_id}
    and converts it to a Base64 Data URI.
    """
    target_url = f"https://www.proeduvate.in/verify/{cert_id}"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=1,
    )
    qr.add_data(target_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    encoded_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded_b64}"


class HTMLCertificateService:
    """Service for rendering Jinja2 HTML templates and compiling into PDF documents."""

    def __init__(self, templates_directory: Optional[Path] = None):
        self.templates_dir = templates_directory or TEMPLATES_DIR
        self.jinja_env = jinja2.Environment(
            loader=jinja2.FileSystemLoader(str(self.templates_dir)),
            autoescape=jinja2.select_autoescape(["html", "xml"])
        )

    def generate_certificate_pdf(self, cert_data: Dict[str, Any]) -> bytes:
        """
        Renders HTML template with dynamic intern data and returns compiled PDF bytes.
        Attempts WeasyPrint first; falls back to xhtml2pdf if GTK / WeasyPrint dependencies are missing.
        """
        cert_id = cert_data.get("cert_id") or cert_data.get("certificate_id") or "PE-2026-FSD-0123"
        intern_name = (cert_data.get("intern_name") or cert_data.get("name") or "JOHN DOE").upper()
        domain = cert_data.get("domain") or "Full Stack Development"
        start_date = cert_data.get("start_date") or "18 August 2026"
        end_date = cert_data.get("end_date") or "18 September 2026"
        duration = cert_data.get("duration") or "1 Month"
        issue_date = (cert_data.get("issue_date") or cert_data.get("issued_date") or "18 September 2026").upper()
        
        score = cert_data.get("score") if cert_data.get("score") is not None else 90
        grade = cert_data.get("grade") or calculate_grade(score)

        bg_data_uri = resolve_background_image_data_uri(grade)
        qr_data_uri = generate_qr_code_data_uri(cert_id)

        context = {
            "intern_name": intern_name,
            "domain": domain,
            "start_date": start_date,
            "end_date": end_date,
            "duration": duration,
            "cert_id": cert_id,
            "issue_date": issue_date,
            "qr_data_uri": qr_data_uri,
            "background_image_path": bg_data_uri,
            "grade": grade,
        }

        template = self.jinja_env.get_template("certificate_template.html")
        rendered_html = template.render(**context)

        # HTML to PDF conversion with WeasyPrint -> xhtml2pdf fallback
        pdf_bytes = None

        # 1. Try WeasyPrint
        try:
            import weasyprint
            pdf_bytes = weasyprint.HTML(string=rendered_html).write_pdf()
        except Exception as e:
            # WeasyPrint missing GTK DLLs or unavailable
            pdf_bytes = None

        # 2. Fallback to xhtml2pdf if WeasyPrint fails or unavailable
        if not pdf_bytes:
            from xhtml2pdf import pisa
            pdf_buffer = io.BytesIO()
            pisa_status = pisa.CreatePDF(
                src=rendered_html,
                dest=pdf_buffer,
                encoding="utf-8"
            )
            if pisa_status.err:
                raise RuntimeError(f"xhtml2pdf rendering failed: {pisa_status.err}")
            pdf_buffer.seek(0)
            pdf_bytes = pdf_buffer.getvalue()

            # Merge with grade background PDF if present for complete visual precision
            candidate_pdf_templates = [
                ASSETS_DIR / f"template_grade_{grade.lower().replace('+', '_plus')}.pdf",
                ASSETS_DIR / "template_grade_a.pdf"
            ]
            bg_pdf_path = next((p for p in candidate_pdf_templates if p.exists()), None)
            if bg_pdf_path:
                try:
                    from pypdf import PdfReader, PdfWriter
                    base_reader = PdfReader(str(bg_pdf_path))
                    overlay_reader = PdfReader(io.BytesIO(pdf_bytes))
                    writer = PdfWriter()
                    page = base_reader.pages[0]
                    page.merge_page(overlay_reader.pages[0])
                    writer.add_page(page)

                    merged_buffer = io.BytesIO()
                    writer.write(merged_buffer)
                    merged_buffer.seek(0)
                    pdf_bytes = merged_buffer.getvalue()
                except Exception as merge_err:
                    pass

        return pdf_bytes

