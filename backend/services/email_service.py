import os
import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send"

class EmailService:
    def __init__(self):
        self.service_id = os.getenv("EMAILJS_SERVICE_ID")
        self.template_id = os.getenv("EMAILJS_TEMPLATE_ID")
        self.public_key = os.getenv("EMAILJS_PUBLIC_KEY")
        self.private_key = os.getenv("EMAILJS_PRIVATE_KEY")
        self.is_configured = all([self.service_id, self.template_id, self.public_key, self.private_key])
        
        if not self.is_configured:
            logger.warning("[EmailService] EmailJS is not fully configured. Emails will only be logged.")

    async def send_email(self, to_email: str, subject: str, template_params: Dict[str, Any]) -> bool:
        """
        Send an email using EmailJS.
        template_params should contain variables mapped in the EmailJS template.
        """
        # Ensure we always pass the required recipient and subject
        params = {
            "to_email": to_email,
            "subject": subject,
            **template_params
        }

        if not self.is_configured:
            logger.info(f"[EmailService - MOCK] Sending email to {to_email} | Subject: {subject} | Params: {params}")
            return True

        payload = {
            "service_id": self.service_id,
            "template_id": self.template_id,
            "user_id": self.public_key,
            "accessToken": self.private_key,
            "template_params": params
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(EMAILJS_API_URL, json=payload, timeout=10.0)
                if response.status_code >= 400:
                    logger.error(f"[EmailService] Failed to send email to {to_email}. Status: {response.status_code}, Response: {response.text}")
                    return False
                logger.info(f"[EmailService] Successfully sent email to {to_email}")
                return True
        except Exception as e:
            logger.error(f"[EmailService] Exception while sending email: {e}")
            return False

email_service = EmailService()
