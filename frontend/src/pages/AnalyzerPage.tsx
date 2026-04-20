import { useRef, useState } from "react";

import { analyzeFile, analyzeLogs } from "../api";
import ResultView from "../components/ResultView";
import type { AnalysisRecord } from "../types";

export default function AnalyzerPage() {
  const [logs, setLogs] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function onAnalyze() {
    if (!logs.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeLogs(logs, label || undefined);
      setRecord(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeFile(file, label || undefined);
      setRecord(res);
      const reader = new FileReader();
      reader.onload = () => setLogs(String(reader.result ?? ""));
      reader.readAsText(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <section className="lg:col-span-2 space-y-4">
        <div>
          <h1 className="text-xl font-semibold mb-1">Paste or upload logs</h1>
          <p className="text-sm text-ink-400">
            Claude clusters errors, infers root causes, and suggests the next
            thing to try.
          </p>
        </div>

        <label className="block text-xs uppercase tracking-wider text-ink-400">
          Label (optional)
        </label>
        <input
          className="w-full bg-ink-800 border border-ink-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="e.g. prod-orders-2026-04-18"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        <label className="block text-xs uppercase tracking-wider text-ink-400">
          Logs
        </label>
        <textarea
          className="w-full h-80 bg-ink-800 border border-ink-700 rounded-md px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Paste log lines here…"
          value={logs}
          onChange={(e) => setLogs(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <button
            className="rounded-md bg-emerald-500 hover:bg-emerald-400 text-ink-900 disabled:bg-ink-700 disabled:text-ink-400 px-4 py-2 text-sm font-medium transition-colors"
            onClick={onAnalyze}
            disabled={loading || !logs.trim()}
          >
            {loading ? "Analyzing…" : "Analyze"}
          </button>
          <button
            className="rounded-md border border-ink-700 hover:border-ink-500 px-3 py-2 text-sm text-ink-200 transition-colors"
            onClick={() => fileInput.current?.click()}
            disabled={loading}
          >
            Upload file
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".log,.txt,text/*"
            className="hidden"
            onChange={onFile}
          />
          {error && (
            <span className="text-sm text-rose-300 ml-auto">{error}</span>
          )}
        </div>
      </section>

      <section className="lg:col-span-3">
        {record ? (
          <ResultView record={record} />
        ) : (
          <div className="rounded-xl border border-dashed border-ink-700 p-10 text-center text-ink-400 h-full flex flex-col items-center justify-center">
            <div className="text-sm">
              Run an analysis to see clustered errors, root causes, and
              suggested fixes.
            </div>
            <div className="text-xs text-ink-500 mt-2">
              Try <code className="font-mono">samples/sample.log</code>.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
