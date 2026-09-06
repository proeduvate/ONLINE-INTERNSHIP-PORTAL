import os
import qrcode
from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "certificates")
os.makedirs(STATIC_DIR, exist_ok=True)

LOGO_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "logo.png")

def generate_certificate_pdf(cert_data: dict) -> str:
    cert_id = cert_data.get('certificate_id')
    file_name = f"{cert_id}.pdf"
    file_path = os.path.join(STATIC_DIR, file_name)
    
    c = canvas.Canvas(file_path, pagesize=landscape(letter))
    width, height = landscape(letter)
    
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
    
    # Main Certificate Content
    c.setFont("Helvetica-Bold", 36)
    c.setFillColor(HexColor("#0F172A"))
    c.drawCentredString(width / 2.0, height - 170, "CERTIFICATE OF COMPLETION")
    
    c.setFont("Helvetica", 16)
    c.setFillColor(HexColor("#475569"))
    c.drawCentredString(width / 2.0, height - 210, "This is proudly presented to")
    
    c.setFont("Helvetica-Bold", 32)
    c.setFillColor(HexColor("#4F46E5"))
    c.drawCentredString(width / 2.0, height - 260, cert_data.get('intern_name', 'Student Name').upper())
    
    body_text = f"For successfully completing the {cert_data.get('duration', 'Internship')} program in"
    c.setFont("Helvetica", 14)
    c.setFillColor(HexColor("#475569"))
    c.drawCentredString(width / 2.0, height - 305, body_text)
    
    c.setFont("Helvetica-Bold", 20)
    c.setFillColor(HexColor("#0F172A"))
    c.drawCentredString(width / 2.0, height - 340, cert_data.get('domain', 'Domain').upper())
    
    achievement = cert_data.get('achievement')
    if achievement:
        c.setFont("Helvetica-Oblique", 14)
        c.setFillColor(HexColor("#EAB308")) 
        c.drawCentredString(width / 2.0, height - 370, f"Achievement: {achievement}")
    
    c.setFont("Helvetica", 12)
    c.setFillColor(HexColor("#0F172A"))
    
    date_str = cert_data.get('issued_date', 'N/A')
    c.drawString(100, 100, f"Date: {date_str}")
    c.line(100, 120, 250, 120)
    
    c.drawString(width - 250, 100, "Authorized Signature")
    c.line(width - 250, 120, width - 100, 120)
    
    qr = qrcode.QRCode(box_size=3, border=1)
    verify_url = f"http://127.0.0.1:3001/verify/{cert_id}"
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
    
    return f"/static/certificates/{file_name}"
