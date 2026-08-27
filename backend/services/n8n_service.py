import os
import httpx
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Webhook path mapping
WEBHOOK_MAPPING = {
    "APPLICATION_SUBMITTED": "/webhook/onboarding/application-received",
    "INTERVIEW_REQUIRED": "/webhook/onboarding/interview-required",
    "INTERVIEW_NOT_REQUIRED": "/webhook/onboarding/interview-not-required",
    "INTERVIEW_SCHEDULED": "/webhook/onboarding/interview-scheduled",
    "INTERVIEW_PASSED": "/webhook/onboarding/interview-passed",
    "INTERVIEW_FAILED": "/webhook/onboarding/interview-failed",
    "PAYMENT_REQUIRED": "/webhook/onboarding/payment-required",
    "PAYMENT_SUBMITTED": "/webhook/onboarding/payment-submitted",
    "PAYMENT_VERIFIED": "/webhook/onboarding/payment-verified",
    "PAYMENT_REJECTED": "/webhook/onboarding/payment-rejected",
    "MENTOR_ASSIGNED": "/webhook/onboarding/mentor-assigned",
    "DOCUMENT_GENERATION_REQUIRED": "/webhook/onboarding/documents-required",
    "DOCUMENTS_READY": "/webhook/onboarding/documents-ready",
    "DOCUMENTS_SENT": "/webhook/onboarding/documents-sent",
    "ACCOUNT_CREATION_REQUIRED": "/webhook/onboarding/account-creation-required",
    "ACCOUNT_CREATED": "/webhook/onboarding/account-created",
    "ACCOUNT_ACTIVATED": "/webhook/onboarding/account-activated",
    "ONBOARDING_COMPLETED": "/webhook/onboarding/completed",
}

async def trigger_n8n_webhook(event_name: str, payload: Dict[str, Any]):
    """
    Triggers an n8n webhook asynchronously using httpx.
    This function catches all exceptions to ensure it doesn't break the main flow.
    """
    n8n_base_url = os.getenv("N8N_BASE_URL", "http://localhost:5678").rstrip("/")
    webhook_secret = os.getenv("N8N_WEBHOOK_SECRET")
    
    if event_name not in WEBHOOK_MAPPING:
        logger.error(f"[n8n] Unknown event: {event_name}")
        return
        
    webhook_path = WEBHOOK_MAPPING[event_name]
    url = f"{n8n_base_url}{webhook_path}"
    
    headers = {}
    if webhook_secret:
        headers["X-N8N-Webhook-Secret"] = webhook_secret
        
    try:
        logger.info(f"[n8n] Triggering {event_name} to {url}")
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=10.0)
            if response.status_code >= 400:
                logger.error(f"[n8n] Webhook failed for {event_name}. Status: {response.status_code}, Response: {response.text}")
            else:
                logger.info(f"[n8n] Webhook request successful for {event_name}")
    except httpx.RequestError as exc:
        logger.error(f"[n8n] RequestError while requesting {exc.request.url!r}: {exc}")
    except Exception as e:
        logger.error(f"[n8n] Unexpected error triggering {event_name}: {e}")
