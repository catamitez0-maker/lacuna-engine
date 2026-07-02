import type { ReactNode } from "react";

export type EnginePanelProps = {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

export function EnginePanel({
  title,
  eyebrow,
  children,
  className = "",
}: EnginePanelProps) {
  return (
    <section
      className={`rounded border border-rule bg-white p-5 shadow-sm ${className}`}
    >
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-signal">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="mb-4 text-xl font-semibold text-ink">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

export type DataBlockProps = {
  title: string;
  value: unknown;
};

export function DataBlock({ title, value }: DataBlockProps) {
  return (
    <div className="rounded border border-rule bg-paper p-4">
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-700">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export type StatusPillProps = {
  children: ReactNode;
};

export function StatusPill({ children }: StatusPillProps) {
  return (
    <span className="inline-flex items-center rounded border border-rule bg-paper px-2.5 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}
