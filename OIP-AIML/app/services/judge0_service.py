import logging
from typing import Any

import requests

from app.config import get_settings
from app.schemas import TestCase, TestCaseResult


logger = logging.getLogger(__name__)


# Common Judge0 language IDs
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


class Judge0Error(Exception):
    """Raised when Judge0 execution fails."""


def get_language_id(language: str) -> int:
    normalized = language.strip().lower()

    if normalized not in LANGUAGE_IDS:
        raise Judge0Error(
            f"Unsupported language: {language}. "
            f"Supported languages: {', '.join(LANGUAGE_IDS.keys())}"
        )

    return LANGUAGE_IDS[normalized]


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

    status = result.get("status", {})
    status_id = status.get("id")
    status_description = status.get(
        "description",
        "Unknown",
    )

    stdout = result.get("stdout")
    stderr = result.get("stderr")
    compile_output = result.get("compile_output")

    actual_output = stdout

    if actual_output is not None:
        actual_output = actual_output.rstrip()

    expected_output = test_case.expected_output.rstrip()

    passed = (
        status_id == 3
        and actual_output == expected_output
    )

    if compile_output:
        stderr = compile_output

    return TestCaseResult(
        test_case_number=0,
        passed=passed,
        status=status_description,
        stdout=stdout,
        stderr=stderr,
        expected_output=test_case.expected_output,
        actual_output=stdout,
        execution_time=result.get("time"),
        memory=result.get("memory"),
    )


def execute_all_test_cases(
    code: str,
    language: str,
    test_cases: list[TestCase],
) -> list[TestCaseResult]:

    results: list[TestCaseResult] = []

    for index, test_case in enumerate(test_cases, start=1):

        result = execute_test_case(
            code=code,
            language=language,
            test_case=test_case,
        )

        result.test_case_number = index

        results.append(result)

    return results