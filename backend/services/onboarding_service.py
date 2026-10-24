import logging
import secrets
from sqlalchemy.orm import Session
import models
from .email_service import dispatch_notification, EventType, FRONTEND_URL
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
                user.interview_scheduled_time = decision_data["scheduled_time"]

            dispatch_notification(
                recipient_email=user.email,
                event_type=EventType.MEETING_SCHEDULED,
                title="Interview Required",
                message=f"An interview is required for your application. We will contact you with scheduling details. Meet Link: {user.interview_meet_link} at {user.interview_scheduled_time}",
                action_url=user.interview_meet_link or FRONTEND_URL
            )
        else:
            user.onboarding_status = "PAYMENT_PENDING"
            payment_link = decision_data.get("payment_form_link", "Link will be provided soon.")
            dispatch_notification(
                recipient_email=user.email,
                event_type=EventType.SYSTEM_ALERT,
                title="Payment Required - Next Steps",
                message=f"Your application is approved. Please proceed to payment to continue onboarding using this form: {payment_link}",
                action_url=payment_link if payment_link.startswith("http") else FRONTEND_URL
            )
        db.commit()

    async def handle_interview_result(self, user: models.User, passed: bool, result_data: dict, db: Session):
        if passed:
            user.onboarding_status = "PAYMENT_PENDING"
            payment_link = result_data.get("payment_form_link", "Link will be provided soon.")
            dispatch_notification(
                recipient_email=user.email,
                event_type=EventType.SYSTEM_ALERT,
                title="Interview Passed - Payment Required",
                message=f"Congratulations! You passed the interview. Please proceed to payment using this form: {payment_link}",
                action_url=payment_link if payment_link.startswith("http") else FRONTEND_URL
            )
        else:
            user.onboarding_status = "REJECTED"
            dispatch_notification(
                recipient_email=user.email,
                event_type=EventType.SYSTEM_ALERT,
                title="Interview Result",
                message="We regret to inform you that you did not pass the interview stage.",
                action_url=FRONTEND_URL
            )
        db.commit()

    async def handle_payment_verify(self, user: models.User, verified: bool, db: Session):
        if verified:
            user.onboarding_status = "DOCUMENTS_PENDING"
            dispatch_notification(
                recipient_email=user.email,
                event_type=EventType.SYSTEM_ALERT,
                title="Payment Verified",
                message="Your payment has been verified. We are now preparing your onboarding documents.",
                action_url=FRONTEND_URL
            )
        else:
            user.onboarding_status = "PAYMENT_REJECTED"
            dispatch_notification(
                recipient_email=user.email,
                event_type=EventType.SYSTEM_ALERT,
                title="Payment Rejected",
                message="Your payment could not be verified. Please contact support.",
                action_url=FRONTEND_URL
            )
        db.commit()

    async def assign_mentor(self, user: models.User, mentor_id: int, db: Session):
        mentor = db.query(models.User).filter(models.User.id == mentor_id, models.User.role == "mentor").first()
        if not mentor:
            mentor = db.query(models.User).filter(models.User.role == "mentor").first()
            if not mentor:
                raise ValueError("No mentors available in the system")
            
        user.mentor_id = mentor.id
        user.onboarding_status = "DOCUMENTS_PENDING"
        db.commit()
        
        dispatch_notification(
            recipient_email=user.email,
            event_type=EventType.TASK_ASSIGNED,
            title="Mentor Assigned",
            message=f"Your mentor {mentor.name} has been assigned.",
            action_url=FRONTEND_URL
        )
        dispatch_notification(
            recipient_email=mentor.email,
            event_type=EventType.TASK_ASSIGNED,
            title="New Intern Assigned",
            message=f"You have been assigned a new intern: {user.name}.",
            action_url=FRONTEND_URL
        )

    async def generate_documents(self, user: models.User, db: Session):
        if not user.intern_id:
            user.intern_id = document_service.generate_intern_id(user)
            
        urls = document_service.process_document_generation(user)
        user.onboarding_status = "ACCOUNT_CREATION_PENDING"
        user.offer_letter_url = urls.get('offer_letter_url')
        user.tc_url = urls.get('terms_url')
        db.commit()
        
        return urls

    async def create_account(self, user: models.User, db: Session):
        # Generate a temporary password
        temp_password = secrets.token_urlsafe(12)
        
        # Hash it for local DB login
        from core.security import pwd_context
        user.hashed_password = pwd_context.hash(temp_password)
        
        # Register in Supabase Auth
        supabase_id = supabase_service.register_user(user.email, temp_password)
        if supabase_id:
            user.supabase_id = supabase_id
            
        user.onboarding_status = "ACCOUNT_ACTIVATION_PENDING"
        db.commit()
        
        dispatch_notification(
            recipient_email=user.email,
            event_type=EventType.SYSTEM_ALERT,
            title="Activate Your Account - Credentials Enclosed",
            message=f"Welcome {user.name}! Your account has been created. Login Email: {user.email}, Temporary Password: {temp_password}. Please log in and change your password.",
            action_url=f"{FRONTEND_URL}/login"
        )

onboarding_service = OnboardingService()
