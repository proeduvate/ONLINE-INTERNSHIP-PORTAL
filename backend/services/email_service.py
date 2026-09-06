import os
import smtplib
from email.message import EmailMessage
import mimetypes

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465")) 
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "your_email@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your_app_password")

def send_certificate_email(intern_email: str, intern_name: str, cert_pdf_path: str):
    if SMTP_EMAIL == "your_email@gmail.com":
        print(f"[MOCK EMAIL] Sending Certificate to {intern_email} with file {cert_pdf_path}")
        return
        
    msg = EmailMessage()
    msg['Subject'] = 'Congratulations! Your Internship Certificate is Ready.'
    msg['From'] = SMTP_EMAIL
    msg['To'] = intern_email
    
    html_content = f"""
    <html>
      <body>
        <h2 style="color: #4F46E5;">Congratulations, {intern_name}!</h2>
        <p>We are thrilled to present your official Certificate of Completion.</p>
        <p>Your hard work and dedication have paid off. Please find your official certificate attached to this email.</p>
        <br>
        <p>Best Regards,</p>
        <p><strong>The Internship Team</strong></p>
      </body>
    </html>
    """
    msg.set_content("Please enable HTML to view this message.")
    msg.add_alternative(html_content, subtype='html')
    
    absolute_pdf_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), cert_pdf_path.lstrip('/'))
    if os.path.exists(absolute_pdf_path):
        with open(absolute_pdf_path, 'rb') as f:
            pdf_data = f.read()
        msg.add_attachment(pdf_data, maintype='application', subtype='pdf', filename=os.path.basename(absolute_pdf_path))
    else:
        print(f"[EMAIL ERROR] PDF not found at {absolute_pdf_path}")
        
    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        print(f"Successfully sent certificate email to {intern_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
