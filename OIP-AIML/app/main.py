import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.schemas import (
    CodeEvaluationRequest,
    CodeEvaluationResponse,
    AIClientRequest,
    AIClientResponse,
)

from app.services.code_evaluation_service import evaluate_code
from app.services.ai_client_service import review_as_ai_client
from app.services.gemini_service import GeminiServiceError
from app.services.judge0_service import Judge0Error


logger = logging.getLogger(__name__)


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="OIP AI Module",
    version="1.0.0",
    description=(
        "AI-powered features for the "
        "Online Internship Portal."
    ),
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# GLOBAL JUDGE0 EXCEPTION HANDLER
# ============================================================

@app.exception_handler(Judge0Error)
async def judge0_exception_handler(
    request: Request,
    exc: Judge0Error,
):
    logger.error(
        "Judge0 service error: %s",
        exc,
    )

    return JSONResponse(
        status_code=503,
        content={
            "error": "Judge0 Service Error",
            "detail": (
                "The code execution service is "
                "currently unavailable."
            ),
        },
    )


# ============================================================
# GLOBAL GEMINI EXCEPTION HANDLER
# ============================================================

@app.exception_handler(GeminiServiceError)
async def gemini_exception_handler(
    request: Request,
    exc: GeminiServiceError,
):
    logger.error(
        "Gemini service error: %s",
        exc,
    )

    return JSONResponse(
        status_code=502,
        content={
            "error": "AI Service Error",
            "detail": (
                "Unable to obtain an AI evaluation "
                "at this time."
            ),
        },
    )


# ============================================================
# GLOBAL UNEXPECTED EXCEPTION HANDLER
# ============================================================

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    logger.exception(
        "Unhandled application exception",
        exc_info=exc,
    )

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": (
                "An unexpected error occurred "
                "while processing the request."
            ),
        },
    )


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


# ============================================================
# FEATURE 1 - AI CODE EVALUATION
# ============================================================

@app.post(
    "/api/ai/evaluate",
    response_model=CodeEvaluationResponse,
)
def evaluate_code_endpoint(
    request: CodeEvaluationRequest,
):
    return evaluate_code(request)


# ============================================================
# FEATURE 2 - AI CLIENT REVIEW
# ============================================================

@app.post(
    "/api/ai/client-review",
    response_model=AIClientResponse,
)
def client_review_endpoint(
    request: AIClientRequest,
):
    return review_as_ai_client(request)