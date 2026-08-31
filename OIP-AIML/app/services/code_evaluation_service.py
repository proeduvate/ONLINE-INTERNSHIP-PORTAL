from app.prompts.code_evaluation_prompt import (
    build_code_evaluation_prompt,
)

from app.schemas import (
    CodeEvaluationRequest,
    CodeEvaluationResponse,
)

from app.services.gemini_service import (
    generate_structured_response,
)

from app.services.judge0_service import (
    execute_all_test_cases,
)


# ============================================================
# CALCULATE AUTHORITATIVE FINAL SCORE
# ============================================================

def calculate_final_score(
    evaluation: CodeEvaluationResponse,
    test_results,
) -> int:

    """
    Calculate the authoritative final score.

    When test cases are available:

        Judge0 correctness       = 50%
        Code quality             = 20%
        Logic                    = 15%
        Requirement adherence    = 15%

    Judge0 execution results are used as the main
    correctness evidence.
    """

    # --------------------------------------------------------
    # NO TEST CASES
    # --------------------------------------------------------

    if not test_results:

        score = (
            evaluation.code_quality * 0.30
            + evaluation.logic * 0.35
            + evaluation.requirement_adherence * 0.35
        )

        return max(
            0,
            min(100, round(score)),
        )

    # --------------------------------------------------------
    # TEST STATISTICS
    # --------------------------------------------------------

    total_tests = len(test_results)

    passed_tests = sum(
        1
        for result in test_results
        if result.passed
    )

    test_score = (
        passed_tests / total_tests
    ) * 100

    # --------------------------------------------------------
    # BASE SCORE
    # --------------------------------------------------------

    score = (
        test_score * 0.50
        + evaluation.code_quality * 0.20
        + evaluation.logic * 0.15
        + evaluation.requirement_adherence * 0.15
    )

    final_score = round(score)

    # --------------------------------------------------------
    # COMPLETE EXECUTION FAILURE
    # --------------------------------------------------------

    if passed_tests == 0:

        statuses = {
            result.status.lower()
            for result in test_results
        }

        if any(
            "compilation error" in status
            for status in statuses
        ):

            final_score = min(
                final_score,
                30,
            )

        elif any(
            "runtime error" in status
            for status in statuses
        ):

            final_score = min(
                final_score,
                30,
            )

        else:

            final_score = min(
                final_score,
                39,
            )

    return max(
        0,
        min(100, final_score),
    )


# ============================================================
# UPDATE EVALUATION USING JUDGE0 RESULTS
# ============================================================

def update_evaluation_based_on_tests(
    evaluation: CodeEvaluationResponse,
    test_results,
) -> CodeEvaluationResponse:

    # --------------------------------------------------------
    # NO TEST CASES
    # --------------------------------------------------------

    if not test_results:

        evaluation.final_score = calculate_final_score(
            evaluation,
            test_results,
        )

        return evaluation

    # --------------------------------------------------------
    # TEST STATISTICS
    # --------------------------------------------------------

    total_tests = len(test_results)

    passed_tests = sum(
        1
        for result in test_results
        if result.passed
    )

    failed_tests = (
        total_tests - passed_tests
    )

    # --------------------------------------------------------
    # EXECUTION SUMMARY
    # --------------------------------------------------------

    if passed_tests == total_tests:

        execution_summary = (
            f"All {total_tests} automated test case(s) "
            "passed successfully."
        )

    elif passed_tests == 0:

        execution_summary = (
            f"All {total_tests} automated test case(s) "
            "failed."
        )

    else:

        execution_summary = (
            f"{passed_tests} of {total_tests} automated "
            f"test case(s) passed and "
            f"{failed_tests} test case(s) failed."
        )

    # --------------------------------------------------------
    # FAILURE DETAILS
    # --------------------------------------------------------

    failure_details = []

    for result in test_results:

        if not result.passed:

            detail = (
                f"Test case {result.test_case_number}: "
                f"{result.status}."
            )

            if result.expected_output:

                detail += (
                    f" Expected output: "
                    f"{result.expected_output!r}."
                )

            if result.actual_output is not None:

                detail += (
                    f" Actual output: "
                    f"{result.actual_output!r}."
                )

            if result.stderr:

                detail += (
                    f" Error: "
                    f"{result.stderr.strip()!r}."
                )

            failure_details.append(
                detail
            )

    # --------------------------------------------------------
    # UPDATE SCORE EXPLANATION
    # --------------------------------------------------------

    original_explanation = (
        evaluation.score_explanation.strip()
    )

    explanation_parts = [
        execution_summary
    ]

    if failure_details:

        explanation_parts.extend(
            failure_details
        )

    explanation_parts.append(
        original_explanation
    )

    evaluation.score_explanation = (
        " ".join(explanation_parts)
    )[:2000]

    # --------------------------------------------------------
    # ADD EXECUTION WEAKNESS
    # --------------------------------------------------------

    if failed_tests > 0:

        execution_weakness = (
            f"{failed_tests} automated test case(s) "
            "failed during Judge0 execution."
        )

        if execution_weakness not in evaluation.weaknesses:

            evaluation.weaknesses = (
                evaluation.weaknesses[:4]
                + [execution_weakness]
            )

    # --------------------------------------------------------
    # ADD EXECUTION STRENGTH
    # --------------------------------------------------------

    if passed_tests == total_tests:

        execution_strength = (
            "All provided automated test cases passed."
        )

        if execution_strength not in evaluation.strengths:

            evaluation.strengths = (
                evaluation.strengths[:4]
                + [execution_strength]
            )

    # --------------------------------------------------------
    # AUTHORITATIVE FINAL SCORE
    # --------------------------------------------------------

    evaluation.final_score = calculate_final_score(
        evaluation,
        test_results,
    )

    # --------------------------------------------------------
    # CONFIDENCE
    # --------------------------------------------------------

    if passed_tests == total_tests:

        evaluation.confidence = "high"

    elif passed_tests == 0:

        evaluation.confidence = "high"

    else:

        evaluation.confidence = "medium"

    return evaluation


# ============================================================
# MAIN CODE EVALUATION FUNCTION
# ============================================================

def evaluate_code(
    submission: CodeEvaluationRequest,
) -> CodeEvaluationResponse:

    test_results = []

    # ========================================================
    # STEP 1: EXECUTE CODE USING JUDGE0
    # ========================================================

    if submission.test_cases:

        test_results = execute_all_test_cases(
            code=submission.code,
            language=submission.language,
            test_cases=submission.test_cases,
        )

    # ========================================================
    # STEP 2: BUILD GEMINI PROMPT
    # ========================================================

    prompt = build_code_evaluation_prompt(
        submission=submission,
        test_results=test_results,
    )

    # ========================================================
    # STEP 3: GEMINI QUALITATIVE EVALUATION
    # ========================================================

    evaluation = generate_structured_response(
        prompt=prompt,
        response_model=CodeEvaluationResponse,
    )

    # ========================================================
    # STEP 4: ATTACH JUDGE0 RESULTS
    # ========================================================

    evaluation.test_results = test_results

    # ========================================================
    # STEP 5: CALCULATE AUTHORITATIVE FINAL SCORE
    # ========================================================

    evaluation = update_evaluation_based_on_tests(
        evaluation=evaluation,
        test_results=test_results,
    )

    return evaluation