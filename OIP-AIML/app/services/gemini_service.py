import json
import logging
from typing import TypeVar

from fastapi import HTTPException
from google import genai
from google.genai import types
from pydantic import BaseModel, ValidationError

from app.config import get_settings


logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


def generate_structured_response(
    prompt: str,
    response_model: type[T],
) -> T:

    settings = get_settings()

    try:
        client = genai.Client(
            api_key=settings.gemini_api_key
        )

        result = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )

        if not result.text:
            raise ValueError(
                "Gemini returned an empty response."
            )

        raw_response = result.text.strip()

        data = json.loads(raw_response)

        return response_model.model_validate(data)

    except json.JSONDecodeError as error:
        logger.exception(
            "Gemini returned invalid JSON"
        )

        raise HTTPException(
            status_code=502,
            detail="Gemini returned invalid JSON.",
        ) from error

    except ValidationError as error:
        logger.exception(
            "Gemini response failed schema validation"
        )

        raise HTTPException(
            status_code=502,
            detail="Gemini returned an invalid response structure.",
        ) from error

    except Exception as error:
        logger.exception(
            "Gemini request failed"
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "Could not obtain an AI response. "
                "Check the Gemini API key and model access."
            ),
        ) from error