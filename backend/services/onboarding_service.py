import logging
import secrets
from sqlalchemy.orm import Session
import models
from .email_service import email_service
from .document_service import document_service

logger = logging.getLogger(__name__)

class OnboardingService:
    
    async def handle_interview_decision(self, user: models.User, is_required: bool, db: Session):
        if is_required:
            user.onboarding_status = "INTERVIEW_PENDING"
            await email_service.send_email(
                user.email,
                "Interview Required",
                {"message": "An interview is required for your application. We will contact you with scheduling details."}
            )
        else:
            user.onboarding_status = "PAYMENT_PENDING"
            await email_service.send_email(
                user.email,
                "Payment Required - Next Steps",
                {"message": "Your application is approved. Please proceed to payment to continue onboarding."}
            )
        db.commit()

    async def handle_interview_result(self, user: models.User, passed: bool, db: Session):
        if passed:
            user.onboarding_status = "PAYMENT_PENDING"
            await email_service.send_email(
                user.email,
                "Interview Passed - Payment Required",
                {"message": "Congratulations! You passed the interview. Please proceed to payment."}
            )
        else:
            user.onboarding_status = "REJECTED"
            await email_service.send_email(
                user.email,
                "Interview Result",
                {"message": "We regret to inform you that you did not pass the interview stage."}
            )
        db.commit()

    async def handle_payment_verify(self, user: models.User, verified: bool, db: Session):
        if verified:
            user.onboarding_status = "MENTOR_ASSIGNMENT_PENDING"
            await email_service.send_email(
                user.email,
                "Payment Verified",
                {"message": "Your payment has been verified. We are now assigning a mentor to you."}
            )
        else:
            user.onboarding_status = "PAYMENT_REJECTED"
            await email_service.send_email(
                user.email,
                "Payment Rejected",
                {"message": "Your payment could not be verified. Please contact support."}
            )
        db.commit()

    async def assign_mentor(self, user: models.User, mentor_id: int, db: Session):
        mentor = db.query(models.User).filter(models.User.id == mentor_id, models.User.role == "mentor").first()
        if not mentor:
            raise ValueError("Invalid mentor ID")
            
        user.mentor_id = mentor.id
        user.onboarding_status = "DOCUMENTS_PENDING"
        db.commit()
        
        await email_service.send_email(
            user.email,
            "Mentor Assigned",
            {"message": f"Your mentor {mentor.name} has been assigned."}
        )
        await email_service.send_email(
            mentor.email,
            "New Intern Assigned",
            {"message": f"You have been assigned a new intern: {user.name}."}
        )

    async def generate_documents(self, user: models.User, db: Session):
        if not user.intern_id:
            user.intern_id = document_service.generate_intern_id(user)
            
        urls = document_service.process_document_generation(user)
        user.onboarding_status = "ACCOUNT_CREATION_PENDING"
        db.commit()
        
        await email_service.send_email(
            user.email,
            "Your Onboarding Documents",
            {"message": f"Please find your documents here: Offer Letter: {urls['offer_letter_url']} | T&C: {urls['terms_url']}"}
        )

    async def create_account(self, user: models.User, db: Session):
        # We generate a token (could be sent as password reset link)
        activation_token = secrets.token_urlsafe(32)
        # Store it somewhere or simply use it in the link (for simplicity in this flow, we simulate sending it)
        user.onboarding_status = "ACCOUNT_ACTIVATION_PENDING"
        db.commit()
        
        await email_service.send_email(
            user.email,
            "Activate Your Account",
            {"message": f"Please activate your account using this token: {activation_token}"}
        )

onboarding_service = OnboardingService()
