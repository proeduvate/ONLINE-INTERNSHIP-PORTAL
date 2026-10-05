import os
import qrcode
from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "certificates")
os.makedirs(STATIC_DIR, exist_ok=True)

LOGO_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "logo.png")

try:
    from app.services.html_certificate_generator import generate_certificate_from_html
except ImportError:
    from services.html_certificate_generator import generate_certificate_from_html

def generate_certificate_pdf(cert_data: dict) -> str:
    cert_id = cert_data.get('certificate_id', 'PRO-INT-0000')
    file_name = f"{cert_id}.pdf"
    file_path = os.path.join(STATIC_DIR, file_name)
    
    pdf_bytes = generate_certificate_from_html(
        cert_id=cert_id,
        intern_name=cert_data.get('intern_name', ''),
        domain=cert_data.get('domain', ''),
        issue_date=cert_data.get('issued_date') or cert_data.get('issue_date') or '',
        start_date=cert_data.get('start_date', ''),
        end_date=cert_data.get('end_date', ''),
        duration=cert_data.get('duration', '1 Month'),
        grade=cert_data.get('grade', 'A'),
        intern_data=cert_data
    )
    
    with open(file_path, "wb") as f:
        f.write(pdf_bytes)
        
    return file_path
