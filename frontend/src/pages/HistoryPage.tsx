import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listHistory } from "../api";
import SeverityBadge from "../components/SeverityBadge";
import type { AnalysisSummary } from "../types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

export default function HistoryPage() {
  const [items, setItems] = useState<AnalysisSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listHistory()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  if (error) {
    return <div className="text-rose-300 text-sm">{error}</div>;
  }
  if (!items) {
    return <div className="text-ink-400 text-sm">Loading…</div>;
  }
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-700 p-10 text-center text-ink-400">
        No analyses yet. Run one on the Analyze page to see it here.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">History</h1>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={`/history/${item.id}`}
              className="block rounded-xl border border-ink-700 bg-ink-800/40 hover:bg-ink-800/70 hover:border-ink-500 transition-colors p-4"
            >
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <SeverityBadge level={item.overall_severity} compact />
                <span className="text-sm font-medium text-ink-100">
                  {item.label || `Analysis #${item.id}`}
                </span>
                <span className="text-xs text-ink-400 ml-auto font-mono">
                  {timeAgo(item.created_at)}
                </span>
              </div>
              <p className="text-sm text-ink-300 line-clamp-2">
                {item.summary}
              </p>
              <div className="mt-2 text-xs text-ink-500 font-mono">
                {item.cluster_count} clusters ·{" "}
                {item.char_count.toLocaleString()} chars
                {item.truncated && " (truncated)"}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
