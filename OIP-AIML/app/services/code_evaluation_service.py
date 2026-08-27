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
    Judge0Error,
    execute_all_test_cases,
)


def evaluate_code(
    submission: CodeEvaluationRequest,
) -> CodeEvaluationResponse:

    test_results = []

    # --------------------------------------------------------
    # STEP 1: Execute code using Judge0
    # --------------------------------------------------------

    if submission.test_cases:

        try:
            test_results = execute_all_test_cases(
                code=submission.code,
                language=submission.language,
                test_cases=submission.test_cases,
            )

        except Judge0Error as error:
            raise error

    # --------------------------------------------------------
    # STEP 2: Build AI evaluation prompt
    # --------------------------------------------------------

    prompt = build_code_evaluation_prompt(
        submission=submission,
        test_results=test_results,
    )

    # --------------------------------------------------------
    # STEP 3: Send execution evidence + code to Gemini
    # --------------------------------------------------------

    evaluation = generate_structured_response(
        prompt=prompt,
        response_model=CodeEvaluationResponse,
    )

    # --------------------------------------------------------
    # STEP 4: Attach actual Judge0 results
    # --------------------------------------------------------

    evaluation.test_results = test_results

    return evaluation