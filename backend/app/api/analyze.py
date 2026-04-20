from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app import llm_service, models
from app.config import settings
from app.database import session_scope
from app.schemas import AnalysisRecord, AnalysisResult, AnalyzeRequest

router = APIRouter()

_PREVIEW_CHARS = 2000


def _truncate(logs: str) -> tuple[str, bool]:
    if len(logs) <= settings.max_log_chars:
        return logs, False
    return logs[: settings.max_log_chars], True


def _persist(
    session: Session,
    label: str | None,
    logs: str,
    truncated: bool,
    result: AnalysisResult,
) -> models.Analysis:
    row = models.Analysis(
        label=label,
        char_count=len(logs),
        truncated=truncated,
        overall_severity=result.overall_severity,
        summary=result.summary,
        raw_preview=logs[:_PREVIEW_CHARS],
        clusters=[
            models.ErrorClusterRow(
                pattern=c.pattern,
                count=c.count,
                severity=c.severity,
                sample_line=c.sample_line,
                root_cause=c.root_cause,
                suggested_fix=c.suggested_fix,
            )
            for c in result.error_clusters
        ],
        anomalies=[
            models.AnomalyRow(description=a.description, evidence=a.evidence)
            for a in result.anomalies
        ],
    )
    session.add(row)
    session.flush()
    session.refresh(row)
    return row


def _to_record(row: models.Analysis, result: AnalysisResult) -> AnalysisRecord:
    return AnalysisRecord(
        id=row.id,
        label=row.label,
        created_at=row.created_at,
        char_count=row.char_count,
        truncated=row.truncated,
        result=result,
    )


def _run(logs: str, label: str | None) -> AnalysisRecord:
    if not logs.strip():
        raise HTTPException(status_code=400, detail="Logs are empty.")

    trimmed, truncated = _truncate(logs)

    try:
        result = llm_service.analyze_logs(trimmed)
    except llm_service.LLMUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    with session_scope() as session:
        row = _persist(session, label, trimmed, truncated, result)
        return _to_record(row, result)


@router.post("/analyze", response_model=AnalysisRecord)
def analyze(payload: AnalyzeRequest) -> AnalysisRecord:
    return _run(payload.logs, payload.label)


@router.post("/analyze/upload", response_model=AnalysisRecord)
async def analyze_upload(
    file: UploadFile = File(...),
    label: str | None = Form(None),
) -> AnalysisRecord:
    raw = await file.read()
    try:
        logs = raw.decode("utf-8", errors="replace")
    except Exception as exc:  # pragma: no cover - decode with replace shouldn't raise
        raise HTTPException(status_code=400, detail="Unable to decode file.") from exc
    effective_label = label or file.filename
    return _run(logs, effective_label)
