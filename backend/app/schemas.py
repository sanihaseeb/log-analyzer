from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

Severity = Literal["critical", "high", "medium", "low"]
OverallSeverity = Literal["critical", "high", "medium", "low", "normal"]


class ErrorCluster(BaseModel):
    pattern: str
    count: int
    severity: Severity
    sample_line: str
    root_cause: str
    suggested_fix: str


class Anomaly(BaseModel):
    description: str
    evidence: str


class AnalysisResult(BaseModel):
    summary: str
    overall_severity: OverallSeverity
    error_clusters: list[ErrorCluster] = Field(default_factory=list)
    anomalies: list[Anomaly] = Field(default_factory=list)


class AnalyzeRequest(BaseModel):
    logs: str = Field(..., min_length=1)
    label: str | None = None


class AnalysisRecord(BaseModel):
    id: int
    label: str | None
    created_at: datetime
    char_count: int
    truncated: bool
    result: AnalysisResult


class AnalysisSummary(BaseModel):
    id: int
    label: str | None
    created_at: datetime
    char_count: int
    truncated: bool
    overall_severity: OverallSeverity
    cluster_count: int
    summary: str
