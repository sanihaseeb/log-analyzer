import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getAnalysis } from "../api";
import ResultView from "../components/ResultView";
import type { AnalysisRecord } from "../types";

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setRecord(null);
    setError(null);
    getAnalysis(id)
      .then(setRecord)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [id]);

  return (
    <div className="space-y-4">
      <Link
        to="/history"
        className="text-sm text-ink-400 hover:text-ink-200 inline-flex items-center gap-1"
      >
        ← Back to history
      </Link>
      {error && <div className="text-rose-300 text-sm">{error}</div>}
      {!error && !record && <div className="text-ink-400 text-sm">Loading…</div>}
      {record && <ResultView record={record} />}
    </div>
  );
}
