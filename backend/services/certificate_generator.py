import os
import qrcode
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "certificates")
os.makedirs(STATIC_DIR, exist_ok=True)

LOGO_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "logo.png")


def generate_certificate_pdf(cert_data: dict) -> str:
    cert_id = cert_data.get('certificate_id', 'PRO-INT-0000')
    file_name = f"{cert_id}.pdf"
    file_path = os.path.join(STATIC_DIR, file_name)

    c = canvas.Canvas(file_path, pagesize=landscape(A4))
    width, height = landscape(A4)

    # Outer and inner border
    c.setLineWidth(10)
    c.setStrokeColor(HexColor("#4F46E5"))
    c.rect(20, 20, width - 40, height - 40)

    c.setLineWidth(2)
    c.setStrokeColor(HexColor("#E2E8F0"))
    c.rect(30, 30, width - 60, height - 60)

    # Proeduvate Logo
    if os.path.exists(LOGO_PATH):
        logo_width = 240
        logo_height = 65
        c.drawImage(LOGO_PATH, (width - logo_width) / 2.0, height - 110, width=logo_width, height=logo_height)
    else:
        c.setFont("Helvetica-Bold", 42)
        c.setFillColor(HexColor("#4F46E5"))
        c.drawCentredString(width / 2.0, height - 85, "PROEDUVATE")

        c.setFont("Helvetica", 14)
        c.setFillColor(HexColor("#64748B"))
        c.drawCentredString(width / 2.0, height - 105, "Empowering the next generation of tech leaders")

    # Grade Badge in Top Right
    grade = cert_data.get('grade', 'A')
    c.setFillColor(HexColor("#EAB308"))
    c.circle(width - 90, height - 90, 45, stroke=0, fill=1)

    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(width - 90, height - 80, "GRADE")
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width - 90, height - 105, str(grade))

    # Main Certificate Content
    c.setFont("Helvetica-Bold", 36)
    c.setFillColor(HexColor("#0F172A"))
    c.drawCentredString(width / 2.0, height - 170, "CERTIFICATE OF COMPLETION")

    c.setFont("Helvetica", 16)
    c.setFillColor(HexColor("#475569"))
    c.drawCentredString(width / 2.0, height - 210, "THIS CERTIFICATE IS AWARDED TO")

    # Auto-scaling font for intern name to prevent clipping
    intern_name = str(cert_data.get('intern_name', 'Student Name')).upper()
    max_name_width = width - 160
    font_size = 32
    while font_size > 14 and c.stringWidth(intern_name, "Helvetica-Bold", font_size) > max_name_width:
        font_size -= 2
    c.setFont("Helvetica-Bold", font_size)
    c.setFillColor(HexColor("#4F46E5"))
    c.drawCentredString(width / 2.0, height - 260, intern_name)

    body_text = "who was associated with ProEduvate as an intern in the field of"
    c.setFont("Helvetica", 14)
    c.setFillColor(HexColor("#475569"))
    c.drawCentredString(width / 2.0, height - 305, body_text)

    # Auto-scaling font for domain text
    domain_text = str(cert_data.get('domain', 'Domain')).upper()
    max_domain_width = width - 160
    domain_font_size = 20
    while domain_font_size > 12 and c.stringWidth(domain_text, "Helvetica-Bold", domain_font_size) > max_domain_width:
        domain_font_size -= 1
    c.setFont("Helvetica-Bold", domain_font_size)
    c.setFillColor(HexColor("#0F172A"))
    c.drawCentredString(width / 2.0, height - 340, domain_text)

    # Details Table
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(HexColor("#475569"))
    table_x = 80
    table_y = height - 400
    c.drawString(table_x, table_y, f"INTERN NAME: {intern_name}")
    c.drawString(table_x, table_y - 20, f"DURATION: {cert_data.get('duration', '1 MONTH')}")
    c.drawString(table_x, table_y - 40, f"PERIOD: {cert_data.get('period', 'N/A')}")
    c.drawString(table_x, table_y - 60, f"ISSUED DATE: {cert_data.get('issued_date', 'N/A')}")

    # CEO Signature
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(HexColor("#0F172A"))
    c.drawString(width - 250, 110, "UMA DEVI. G / CEO")
    c.line(width - 250, 105, width - 100, 105)
    c.setFont("Helvetica", 12)
    c.setFillColor(HexColor("#475569"))
    c.drawString(width - 250, 85, "Authorized Signature")

    # QR Code
    qr = qrcode.QRCode(box_size=3, border=1)
    verify_url = f"https://proeduvate.com/verify/{cert_id}"
    qr.add_data(verify_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    qr_path = os.path.join(STATIC_DIR, f"qr_{cert_id}.png")
    img.save(qr_path)

    c.drawImage(qr_path, width / 2.0 - 45, 50, width=90, height=90)

    if os.path.exists(qr_path):
        os.remove(qr_path)

    c.setFont("Helvetica", 10)
    c.setFillColor(HexColor("#94A3B8"))
    c.drawCentredString(width / 2.0, 35, f"Verify at: {verify_url}")
    c.drawCentredString(width / 2.0, 20, f"ID: {cert_id}")

    c.save()

    return file_path
