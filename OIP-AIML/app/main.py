from fastapi import FastAPI, HTTPException

from app.config import get_settings
from app.schemas import (
    AIClientRequest,
    AIClientResponse,
    CodeEvaluationRequest,
    CodeEvaluationResponse,
)
from app.services.ai_client_service import review_as_ai_client
from app.services.code_evaluation_service import evaluate_code
from app.services.judge0_service import Judge0Error


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "AI/ML services for the Online Internship Portal. "
        "Includes AI-powered code evaluation and AI Client."
    ),
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": settings.app_name,
    }


# ============================================================
# FEATURE 1 - AI CODE EVALUATION
# ============================================================

@app.post(
    "/api/ai/evaluate",
    response_model=CodeEvaluationResponse,
)
def evaluate_submission(
    submission: CodeEvaluationRequest,
) -> CodeEvaluationResponse:

    try:
        return evaluate_code(submission)

    except Judge0Error as error:
        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error


# ============================================================
# FEATURE 2 - AI CLIENT
# ============================================================

@app.post(
    "/api/ai/client-review",
    response_model=AIClientResponse,
)
def ai_client_review(
    submission: AIClientRequest,
) -> AIClientResponse:

    return review_as_ai_client(submission)