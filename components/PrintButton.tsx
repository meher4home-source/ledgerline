"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print rounded-sm bg-ink-900 px-5 py-2.5 font-mono text-sm text-parchment-100 hover:bg-ink-800"
    >
      Print / Save as PDF
    </button>
  );
}
