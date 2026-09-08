import os
import requests
import smtplib
from email.message import EmailMessage
from enum import Enum
from typing import Optional, Dict, Any
import traceback
from dotenv import load_dotenv

load_dotenv()

# --- EmailJS Configuration (Supports standard and REACT_APP_ prefixes) ---
EMAILJS_SERVICE_ID = os.getenv("EMAILJS_SERVICE_ID") or os.getenv("REACT_APP_EMAILJS_SERVICE_ID")
EMAILJS_TEMPLATE_ID = os.getenv("EMAILJS_TEMPLATE_ID") or os.getenv("REACT_APP_EMAILJS_TEMPLATE_ID")
EMAILJS_PUBLIC_KEY = os.getenv("EMAILJS_PUBLIC_KEY") or os.getenv("REACT_APP_EMAILJS_PUBLIC_KEY")
EMAILJS_PRIVATE_KEY = os.getenv("EMAILJS_PRIVATE_KEY") or os.getenv("REACT_APP_EMAILJS_PRIVATE_KEY")

# --- SMTP Configuration (for PDF Certificate Attachments) ---
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "your_email@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your_app_password")


def send_email_notification(to_email: str, title: str, message: str, action_link: str = "") -> bool:
    """
    Sends portal event notifications (e.g., meeting scheduled, breakout room admission)
    using the EmailJS REST API.
    """
    url = "https://api.emailjs.com/api/v1.0/email/send"
    
    payload = {
        "service_id": EMAILJS_SERVICE_ID,
        "template_id": EMAILJS_TEMPLATE_ID,
        "user_id": EMAILJS_PUBLIC_KEY,
        "template_params": {
            "to_email": to_email,
            "notification_title": title,
            "message_body": message,
            "action_link": action_link,
            "timestamp": "Just now",
        }
    }
    
    if EMAILJS_PRIVATE_KEY:
        payload["accessToken"] = EMAILJS_PRIVATE_KEY

    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print(f"[EmailJS] Notification successfully sent to {to_email}")
            return True
        print(f"[EmailJS Error] Status: {response.status_code}, Body: {response.text}")
        return False
    except Exception as e:
        print(f"[EmailJS Exception] Failed to send notification: {e}")
        return False


def send_certificate_email(intern_email: str, intern_name: str, cert_pdf_path: str):
    """
    Sends the generated PDF certificate to the intern using SMTP.
    """
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
        msg.add_attachment(
            pdf_data,
            maintype='application',
            subtype='pdf',
            filename=os.path.basename(absolute_pdf_path)
        )
    else:
        print(f"[EMAIL ERROR] PDF not found at {absolute_pdf_path}")
        
    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        print(f"Successfully sent certificate email to {intern_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

class EventType(str, Enum):
    MEETING_SCHEDULED = "MEETING_SCHEDULED"
    TASK_ASSIGNED = "TASK_ASSIGNED"
    ROOM_ADMISSION = "ROOM_ADMISSION"
    SYSTEM_ALERT = "SYSTEM_ALERT"
    AIRDROP_ASSIGNMENT = "AIRDROP_ASSIGNMENT"

def dispatch_notification(
    recipient_email: str, 
    event_type: EventType, 
    title: str, 
    message: str, 
    action_url: str, 
    metadata: Optional[Dict[str, Any]] = None
) -> None:
    try:
        prefix = ""
        if event_type == EventType.MEETING_SCHEDULED:
            prefix = "?? [MEETING] "
        elif event_type == EventType.TASK_ASSIGNED:
            prefix = "?? [NEW RESOURCE] "
        elif event_type == EventType.AIRDROP_ASSIGNMENT:
            prefix = "?? [AIRDROP] "
        elif event_type == EventType.ROOM_ADMISSION:
            prefix = "?? [BREAKOUT ROOM] "
            
        full_title = f"{prefix}{title}"
        
        url = 'https://api.emailjs.com/api/v1.0/email/send'
        payload = {
            'service_id': EMAILJS_SERVICE_ID,
            'template_id': EMAILJS_TEMPLATE_ID,
            'user_id': EMAILJS_PUBLIC_KEY,
            'template_params': {
                'to_email': recipient_email,
                'notification_title': full_title,
                'message_body': message,
                'action_link': action_url,
                'timestamp': 'Just now'
            }
        }
        if EMAILJS_PRIVATE_KEY:
            payload['accessToken'] = EMAILJS_PRIVATE_KEY
            
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            print(f"[DISPATCH SUCCESS] Notified {recipient_email} about {event_type.value}")
        else:
            print(f"[DISPATCH HTTP ERROR] {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"[DISPATCH EXCEPTION] Failed to send to {recipient_email}: {e}")
        traceback.print_exc()

