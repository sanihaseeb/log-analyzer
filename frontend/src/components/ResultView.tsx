import type { AnalysisRecord } from "../types";
import SeverityBadge from "./SeverityBadge";

interface Props {
  record: AnalysisRecord;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function ResultView({ record }: Props) {
  const { result } = record;
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-ink-700 bg-ink-800/60 p-5">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <SeverityBadge level={result.overall_severity} />
          <span className="text-xs text-ink-400 font-mono">
            #{record.id} · {formatDate(record.created_at)}
          </span>
          {record.label && (
            <span className="text-xs text-ink-400">· {record.label}</span>
          )}
          <span className="text-xs text-ink-500 ml-auto font-mono">
            {record.char_count.toLocaleString()} chars
            {record.truncated && " (truncated)"}
          </span>
        </div>
        <p className="text-ink-100 leading-relaxed">{result.summary}</p>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-ink-400 mb-3">
          Error clusters ({result.error_clusters.length})
        </h2>
        {result.error_clusters.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-700 p-6 text-center text-ink-400">
            No recurring errors detected.
          </div>
        ) : (
          <div className="space-y-3">
            {result.error_clusters.map((c, i) => (
              <article
                key={i}
                className="rounded-xl border border-ink-700 bg-ink-800/40 p-5"
              >
                <header className="flex flex-wrap items-center gap-3 mb-3">
                  <SeverityBadge level={c.severity} compact />
                  <span className="font-mono text-ink-500 text-xs">
                    x{c.count}
                  </span>
                  <h3 className="font-medium text-ink-100">{c.pattern}</h3>
                </header>
                <pre className="text-xs font-mono bg-ink-900 border border-ink-700 rounded-md p-3 overflow-x-auto text-ink-300 mb-3">
                  {c.sample_line}
                </pre>
                <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-ink-400 mb-1 text-xs uppercase tracking-wider">
                      Root cause
                    </dt>
                    <dd className="text-ink-100 leading-relaxed">
                      {c.root_cause}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-400 mb-1 text-xs uppercase tracking-wider">
                      Suggested fix
                    </dt>
                    <dd className="text-ink-100 leading-relaxed">
                      {c.suggested_fix}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      {result.anomalies.length > 0 && (
        <section>
          <h2 className="text-sm uppercase tracking-wider text-ink-400 mb-3">
            Anomalies ({result.anomalies.length})
          </h2>
          <div className="space-y-3">
            {result.anomalies.map((a, i) => (
              <article
                key={i}
                className="rounded-xl border border-ink-700 bg-ink-800/40 p-4"
              >
                <p className="text-ink-100 mb-2">{a.description}</p>
                <pre className="text-xs font-mono bg-ink-900 border border-ink-700 rounded-md p-3 overflow-x-auto text-ink-300">
                  {a.evidence}
                </pre>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
