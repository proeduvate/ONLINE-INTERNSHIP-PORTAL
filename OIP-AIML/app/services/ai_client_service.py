from app.prompts.ai_client_prompt import (
    build_ai_client_prompt,
)

from app.schemas import (
    AIClientRequest,
    AIClientResponse,
)

from app.services.gemini_service import (
    generate_structured_response,
)


def review_as_ai_client(
    submission: AIClientRequest,
) -> AIClientResponse:

    prompt = build_ai_client_prompt(
        submission
    )

    response = generate_structured_response(
        prompt=prompt,
        response_model=AIClientResponse,
    )

    return response