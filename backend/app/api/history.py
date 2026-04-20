from __future__ import annotations

from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app import models
from app.database import session_scope
from app.schemas import (
    AnalysisRecord,
    AnalysisResult,
    AnalysisSummary,
    Anomaly,
    ErrorCluster,
)

router = APIRouter()


def _to_result(row: models.Analysis) -> AnalysisResult:
    return AnalysisResult(
        summary=row.summary,
        overall_severity=row.overall_severity,  # type: ignore[arg-type]
        error_clusters=[
            ErrorCluster(
                pattern=c.pattern,
                count=c.count,
                severity=c.severity,  # type: ignore[arg-type]
                sample_line=c.sample_line,
                root_cause=c.root_cause,
                suggested_fix=c.suggested_fix,
            )
            for c in row.clusters
        ],
        anomalies=[
            Anomaly(description=a.description, evidence=a.evidence)
            for a in row.anomalies
        ],
    )


@router.get("/history", response_model=list[AnalysisSummary])
def list_history(limit: int = 25) -> list[AnalysisSummary]:
    limit = max(1, min(limit, 200))
    with session_scope() as session:
        rows = (
            session.execute(
                select(models.Analysis)
                .options(selectinload(models.Analysis.clusters))
                .order_by(models.Analysis.created_at.desc())
                .limit(limit)
            )
            .scalars()
            .all()
        )
        return [
            AnalysisSummary(
                id=r.id,
                label=r.label,
                created_at=r.created_at,
                char_count=r.char_count,
                truncated=r.truncated,
                overall_severity=r.overall_severity,  # type: ignore[arg-type]
                cluster_count=len(r.clusters),
                summary=r.summary,
            )
            for r in rows
        ]


@router.get("/history/{analysis_id}", response_model=AnalysisRecord)
def get_analysis(analysis_id: int) -> AnalysisRecord:
    with session_scope() as session:
        row = session.execute(
            select(models.Analysis)
            .options(
                selectinload(models.Analysis.clusters),
                selectinload(models.Analysis.anomalies),
            )
            .where(models.Analysis.id == analysis_id)
        ).scalar_one_or_none()
        if row is None:
            raise HTTPException(status_code=404, detail="Analysis not found.")
        return AnalysisRecord(
            id=row.id,
            label=row.label,
            created_at=row.created_at,
            char_count=row.char_count,
            truncated=row.truncated,
            result=_to_result(row),
        )
