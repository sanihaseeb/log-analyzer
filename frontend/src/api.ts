import type { AnalysisRecord, AnalysisSummary } from "./types";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function analyzeLogs(
  logs: string,
  label?: string,
): Promise<AnalysisRecord> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logs, label: label || null }),
  });
  return json<AnalysisRecord>(res);
}

export async function analyzeFile(
  file: File,
  label?: string,
): Promise<AnalysisRecord> {
  const form = new FormData();
  form.append("file", file);
  if (label) form.append("label", label);
  const res = await fetch("/api/analyze/upload", {
    method: "POST",
    body: form,
  });
  return json<AnalysisRecord>(res);
}

export async function listHistory(): Promise<AnalysisSummary[]> {
  const res = await fetch("/api/history");
  return json<AnalysisSummary[]>(res);
}

export async function getAnalysis(id: number | string): Promise<AnalysisRecord> {
  const res = await fetch(`/api/history/${id}`);
  return json<AnalysisRecord>(res);
}
