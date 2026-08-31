import json
import logging
from typing import TypeVar

from google import genai
from google.genai import types
from pydantic import BaseModel, ValidationError

from app.config import get_settings


logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


# ============================================================
# CUSTOM GEMINI EXCEPTION
# ============================================================

class GeminiServiceError(Exception):
    """
    Raised when Gemini processing fails.
    """


# ============================================================
# GENERATE STRUCTURED GEMINI RESPONSE
# ============================================================

def generate_structured_response(
    prompt: str,
    response_model: type[T],
) -> T:

    settings = get_settings()

    try:

        # ----------------------------------------------------
        # CREATE GEMINI CLIENT
        # ----------------------------------------------------

        client = genai.Client(
            api_key=settings.gemini_api_key
        )

        # ----------------------------------------------------
        # GENERATE RESPONSE
        # ----------------------------------------------------

        result = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )

        # ----------------------------------------------------
        # CHECK EMPTY RESPONSE
        # ----------------------------------------------------

        if not result.text:

            raise GeminiServiceError(
                "Gemini returned an empty response."
            )

        # ----------------------------------------------------
        # PARSE JSON
        # ----------------------------------------------------

        raw_response = result.text.strip()

        try:

            data = json.loads(
                raw_response
            )

        except json.JSONDecodeError as error:

            logger.exception(
                "Gemini returned invalid JSON."
            )

            raise GeminiServiceError(
                "Gemini returned invalid JSON."
            ) from error

        # ----------------------------------------------------
        # VALIDATE RESPONSE STRUCTURE
        # ----------------------------------------------------

        try:

            return response_model.model_validate(
                data
            )

        except ValidationError as error:

            logger.exception(
                "Gemini response failed schema validation."
            )

            raise GeminiServiceError(
                "Gemini returned an invalid response structure."
            ) from error

    # --------------------------------------------------------
    # RE-RAISE OUR OWN SERVICE ERRORS
    # --------------------------------------------------------

    except GeminiServiceError:
        raise

    # --------------------------------------------------------
    # HANDLE GEMINI API / NETWORK / OTHER ERRORS
    # --------------------------------------------------------

    except Exception as error:

        logger.exception(
            "Gemini request failed."
        )

        raise GeminiServiceError(
            "Could not obtain a response from Gemini."
        ) from error