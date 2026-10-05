import logging
from sqlalchemy.orm import Session
import models
from .email_service import email_service

logger = logging.getLogger(__name__)

class ReminderService:
    
    async def process_reminders(self, db: Session):
        """Finds pending statuses and sends appropriate reminders."""
        
        logger.info("[ReminderService] Processing daily reminders...")
        
        pending_statuses = {
            "PAYMENT_PENDING": "Reminder: Please complete your payment to proceed with onboarding.",
            "INTERVIEW_PENDING": "Reminder: Please schedule/attend your interview to proceed.",
            "ACCOUNT_ACTIVATION_PENDING": "Reminder: Please activate your account.",
            "DOCUMENTS_PENDING": "Reminder: Your documents are being prepared, please check back soon."
        }
        
        users = db.query(models.User).filter(models.User.onboarding_status.in_(pending_statuses.keys())).all()
        
        for user in users:
            message = pending_statuses.get(user.onboarding_status)
            if message:
                await email_service.send_email(
                    user.email,
                    "Action Required - Onboarding Reminder",
                    {"message": message}
                )
                logger.info(f"[ReminderService] Sent reminder to {user.email} (Status: {user.onboarding_status})")

reminder_service = ReminderService()
