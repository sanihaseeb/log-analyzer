from __future__ import annotations

from google import genai
from google.genai import errors as genai_errors
from google.genai import types

from app.config import settings
from app.schemas import AnalysisResult

_SYSTEM_PROMPT = """You are a senior site reliability engineer reviewing production logs.

Be precise and evidence-driven:
- Cluster truly similar errors (same exception + same call site). Do not over-merge.
- Prefer concrete root causes tied to what the logs actually show over generic advice.
- Counts must reflect the log lines you were given. If you cannot determine an exact count, give your best estimate.
- Severity rubric: critical = customer-facing outage or data loss signals; high = repeated failures of a core flow; medium = degraded but working; low = warnings/cosmetic.
- Keep suggested fixes specific (file, function, config, query) when the logs make that possible; otherwise give the first concrete diagnostic step.
- If the logs look healthy, return an empty clusters list, no anomalies, and overall_severity = "normal".

Respond with a JSON object that matches the required schema exactly."""


class LLMUnavailable(RuntimeError):
    pass


def _client() -> genai.Client:
    if not settings.gemini_api_key:
        raise LLMUnavailable(
            "GEMINI_API_KEY is not configured. Set it in backend/.env."
        )
    return genai.Client(api_key=settings.gemini_api_key)


def analyze_logs(logs: str) -> AnalysisResult:
    client = _client()
    prompt = f"Analyze the following logs:\n\n<logs>\n{logs}\n</logs>"

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=AnalysisResult,
                temperature=0.1,
            ),
        )
    except genai_errors.ClientError as exc:
        status = getattr(exc, "code", None) or getattr(exc, "status_code", None)
        detail = _error_detail(exc)
        if status == 401 or status == 403:
            raise LLMUnavailable(
                "Gemini rejected the API key. Check GEMINI_API_KEY in backend/.env."
            ) from exc
        if status == 429:
            raise LLMUnavailable(
                "Gemini rate limit hit. Try again in a moment."
            ) from exc
        raise LLMUnavailable(_compose("Gemini API error", status, detail)) from exc
    except genai_errors.ServerError as exc:
        status = getattr(exc, "code", None) or getattr(exc, "status_code", None)
        raise LLMUnavailable(
            _compose("Gemini server error", status, _error_detail(exc))
        ) from exc
    except genai_errors.APIError as exc:
        raise LLMUnavailable(f"Gemini API error: {exc}") from exc

    parsed = response.parsed
    if isinstance(parsed, AnalysisResult):
        return parsed
    if isinstance(parsed, dict):
        return AnalysisResult.model_validate(parsed)

    text = (response.text or "").strip()
    if not text:
        raise LLMUnavailable("Gemini returned an empty response.")
    return AnalysisResult.model_validate_json(text)


def _error_detail(exc: Exception) -> str:
    message = getattr(exc, "message", None)
    if message:
        return str(message)
    return str(exc)


def _compose(label: str, status: int | None, detail: str) -> str:
    head = f"{label} ({status})" if status else label
    return f"{head}: {detail}" if detail else head
