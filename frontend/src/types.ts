export type Severity = "critical" | "high" | "medium" | "low";
export type OverallSeverity = Severity | "normal";

export interface ErrorCluster {
  pattern: string;
  count: number;
  severity: Severity;
  sample_line: string;
  root_cause: string;
  suggested_fix: string;
}

export interface Anomaly {
  description: string;
  evidence: string;
}

export interface AnalysisResult {
  summary: string;
  overall_severity: OverallSeverity;
  error_clusters: ErrorCluster[];
  anomalies: Anomaly[];
}

export interface AnalysisRecord {
  id: number;
  label: string | null;
  created_at: string;
  char_count: number;
  truncated: boolean;
  result: AnalysisResult;
}

export interface AnalysisSummary {
  id: number;
  label: string | null;
  created_at: string;
  char_count: number;
  truncated: boolean;
  overall_severity: OverallSeverity;
  cluster_count: number;
  summary: string;
}
