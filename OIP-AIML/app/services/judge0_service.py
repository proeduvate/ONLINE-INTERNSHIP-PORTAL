import logging
from typing import Any

import requests

from app.config import get_settings
from app.schemas import TestCase, TestCaseResult


logger = logging.getLogger(__name__)


# ============================================================
# JUDGE0 LANGUAGE IDs
# ============================================================

LANGUAGE_IDS = {
    "python": 71,
    "python3": 71,

    "javascript": 63,
    "js": 63,

    "java": 62,

    "c": 50,

    "cpp": 54,
    "c++": 54,

    "csharp": 51,
    "c#": 51,

    "go": 60,

    "rust": 73,

    "php": 68,

    "ruby": 72,

    "kotlin": 78,

    "swift": 83,
}


# ============================================================
# CUSTOM ERROR
# ============================================================

class Judge0Error(Exception):
    """Raised when Judge0 cannot be reached or returns an invalid response."""


# ============================================================
# LANGUAGE ID
# ============================================================

def get_language_id(language: str) -> int:
    normalized = language.strip().lower()

    if normalized not in LANGUAGE_IDS:
        raise Judge0Error(
            f"Unsupported language: {language}. "
            f"Supported languages: {', '.join(LANGUAGE_IDS.keys())}"
        )

    return LANGUAGE_IDS[normalized]


# ============================================================
# EXECUTE ONE TEST CASE
# ============================================================

def execute_test_case(
    code: str,
    language: str,
    test_case: TestCase,
) -> TestCaseResult:

    settings = get_settings()

    language_id = get_language_id(language)

    url = (
        f"{settings.judge0_url.rstrip('/')}"
        "/submissions"
        "?base64_encoded=false"
        "&wait=true"
    )

    payload = {
        "language_id": language_id,
        "source_code": code,
        "stdin": test_case.stdin,
    }

    # --------------------------------------------------------
    # Send code to Judge0
    # --------------------------------------------------------

    try:
        response = requests.post(
            url,
            json=payload,
            timeout=30,
        )

        response.raise_for_status()

        result: dict[str, Any] = response.json()

    except requests.RequestException as error:

        logger.exception("Judge0 request failed")

        raise Judge0Error(
            f"Unable to communicate with Judge0: {error}"
        ) from error

    except ValueError as error:

        logger.exception("Judge0 returned invalid JSON")

        raise Judge0Error(
            "Judge0 returned an invalid response."
        ) from error

    # --------------------------------------------------------
    # Extract Judge0 response
    # --------------------------------------------------------

    status = result.get("status") or {}

    status_id = status.get("id")

    status_description = status.get(
        "description",
        "Unknown",
    )

    stdout = result.get("stdout")

    stderr = result.get("stderr")

    compile_output = result.get("compile_output")

    # --------------------------------------------------------
    # Normalize outputs for comparison
    # --------------------------------------------------------

    actual_output = (
        stdout.rstrip()
        if stdout is not None
        else None
    )

    expected_output = (
        test_case.expected_output.rstrip()
    )

    # --------------------------------------------------------
    # Determine whether test passed
    # --------------------------------------------------------

    passed = (
        status_id == 3
        and actual_output == expected_output
    )

    # --------------------------------------------------------
    # Compilation error
    # --------------------------------------------------------

    if compile_output:

        stderr = compile_output

    # --------------------------------------------------------
    # Wrong Answer
    # --------------------------------------------------------

    if status_id == 3 and not passed:

        status_description = "Wrong Answer"

    # --------------------------------------------------------
    # Build result
    # --------------------------------------------------------

    return TestCaseResult(
        test_case_number=0,

        passed=passed,

        status=status_description,

        stdout=stdout,

        stderr=stderr,

        expected_output=test_case.expected_output,

        actual_output=actual_output,

        execution_time=result.get("time"),

        memory=result.get("memory"),
    )


# ============================================================
# EXECUTE ALL TEST CASES
# ============================================================

def execute_all_test_cases(
    code: str,
    language: str,
    test_cases: list[TestCase],
) -> list[TestCaseResult]:

    results: list[TestCaseResult] = []

    for index, test_case in enumerate(
        test_cases,
        start=1,
    ):

        result = execute_test_case(
            code=code,
            language=language,
            test_case=test_case,
        )

        result.test_case_number = index

        results.append(result)

    return results