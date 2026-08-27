from typing import Literal

from pydantic import BaseModel, Field


# ============================================================
# FEATURE 1 - AI CODE EVALUATION
# ============================================================

class TestCase(BaseModel):
    stdin: str = ""
    expected_output: str


class CodeEvaluationRequest(BaseModel):
    task: str = Field(min_length=5, max_length=4000)
    code: str = Field(min_length=1, max_length=20000)
    language: str = Field(min_length=1, max_length=50)
    test_cases: list[TestCase] = Field(default_factory=list, max_length=20)


class TestCaseResult(BaseModel):
    test_case_number: int
    passed: bool
    status: str
    stdout: str | None = None
    stderr: str | None = None
    expected_output: str
    actual_output: str | None = None
    execution_time: str | None = None
    memory: int | None = None


class CodeEvaluationResponse(BaseModel):
    final_score: int = Field(ge=0, le=100)
    code_quality: int = Field(ge=0, le=100)
    logic: int = Field(ge=0, le=100)
    requirement_adherence: int = Field(ge=0, le=100)

    complexity: str = Field(min_length=1, max_length=200)

    strengths: list[str] = Field(default_factory=list, max_length=5)
    weaknesses: list[str] = Field(default_factory=list, max_length=5)

    score_explanation: str = Field(min_length=1, max_length=2000)

    confidence: Literal["low", "medium", "high"]

    test_results: list[TestCaseResult] = Field(default_factory=list)


# ============================================================
# FEATURE 2 - AI CLIENT
# ============================================================

class AIClientRequest(BaseModel):
    task: str = Field(min_length=5, max_length=5000)

    implementation: str = Field(
        min_length=1,
        max_length=30000,
    )

    technology: str = Field(
        min_length=1,
        max_length=200,
    )

    previous_feedback: str | None = Field(
        default=None,
        max_length=5000,
    )


class AIClientResponse(BaseModel):
    satisfied: bool

    client_message: str = Field(
        min_length=1,
        max_length=3000,
    )

    additional_requirements: list[str] = Field(
        default_factory=list,
        max_length=10,
    )

    strengths: list[str] = Field(
        default_factory=list,
        max_length=5,
    )

    priority: Literal["low", "medium", "high"]

    next_action: str = Field(
        min_length=1,
        max_length=1000,
    )