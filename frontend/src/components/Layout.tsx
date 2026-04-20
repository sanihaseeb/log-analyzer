import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-md text-sm transition-colors ${
      isActive
        ? "bg-ink-700 text-white"
        : "text-ink-300 hover:text-white hover:bg-ink-800"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink-700 bg-ink-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-400 to-violet-600" />
            <span className="font-semibold tracking-tight">Log Analyzer</span>
            <span className="text-xs text-ink-400 hidden sm:inline">
              Claude-powered triage
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Analyze
            </NavLink>
            <NavLink to="/history" className={linkClass}>
              History
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">{children}</main>
      <footer className="border-t border-ink-700 text-xs text-ink-400">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between">
          <span>Built with FastAPI, Claude, and React.</span>
          <span className="font-mono text-ink-500">v0.1.0</span>
        </div>
      </footer>
    </div>
  );
}
