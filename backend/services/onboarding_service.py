import logging
import secrets
from sqlalchemy.orm import Session
import models
from .email_service import email_service
from .document_service import document_service
from .supabase_service import supabase_service

logger = logging.getLogger(__name__)

class OnboardingService:
    
    async def handle_interview_decision(self, user: models.User, is_required: bool, decision_data: dict, db: Session):
        if is_required:
            user.onboarding_status = "INTERVIEW_SCHEDULED"
            
            if "meet_link" in decision_data:
                user.interview_meet_link = decision_data["meet_link"]
            if "scheduled_time" in decision_data:
                # Expecting ISO format string or similar datetime parsing could happen here,
                # but we'll assume it's pre-parsed by the router or simple string assignment for now.
                # Actually, router should parse it, but let's just assign it if it's already a datetime,
                # or rely on SQLAlchemy to cast it.
                user.interview_scheduled_time = decision_data["scheduled_time"]

            await email_service.send_email(
                user.email,
                "Interview Required",
                {"message": f"An interview is required for your application. We will contact you with scheduling details. Meet Link: {user.interview_meet_link} at {user.interview_scheduled_time}"}
            )
        else:
            user.onboarding_status = "PAYMENT_PENDING"
            payment_link = decision_data.get("payment_form_link", "Link will be provided soon.")
            await email_service.send_email(
                user.email,
                "Payment Required - Next Steps",
                {"message": f"Your application is approved. Please proceed to payment to continue onboarding using this form: {payment_link}"}
            )
        db.commit()

    async def handle_interview_result(self, user: models.User, passed: bool, result_data: dict, db: Session):
        if passed:
            user.onboarding_status = "PAYMENT_PENDING"
            payment_link = result_data.get("payment_form_link", "Link will be provided soon.")
            await email_service.send_email(
                user.email,
                "Interview Passed - Payment Required",
                {"message": f"Congratulations! You passed the interview. Please proceed to payment using this form: {payment_link}"}
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
            user.onboarding_status = "DOCUMENTS_PENDING"
            await email_service.send_email(
                user.email,
                "Payment Verified",
                {"message": "Your payment has been verified. We are now preparing your onboarding documents."}
            )
            # In actual implementation, we might call generate_documents here automatically 
            # or it can be a separate manual step triggered by the admin.
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
            # Fallback to the first available mentor if the ID is invalid
            mentor = db.query(models.User).filter(models.User.role == "mentor").first()
            if not mentor:
                raise ValueError("No mentors available in the system")
            
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
        # Generate a temporary password
        temp_password = secrets.token_urlsafe(12)
        
        # Register in Supabase Auth
        supabase_id = supabase_service.register_user(user.email, temp_password)
        if supabase_id:
            user.supabase_id = supabase_id
            
        user.onboarding_status = "ACCOUNT_ACTIVATION_PENDING"
        db.commit()
        
        await email_service.send_email(
            user.email,
            "Activate Your Account",
            {"message": f"Your account has been created. Please log in using your email and this temporary password: {temp_password}. Remember to change your password after logging in."}
        )

onboarding_service = OnboardingService()
