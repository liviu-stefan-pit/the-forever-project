/** Skeleton, error and empty states shared by every page. */
import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function GuideSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading guide">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-44 w-full rounded-sm" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="wow-frame flex gap-3 p-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ title, error, retry }: { title: string; error?: Error; retry?: () => void }) {
  return (
    <div role="alert" className="wow-frame panel-animate border-rt-warn/40 p-6">
      <div className="flex items-start gap-3">
        <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0 text-rt-warn" />
        <div className="min-w-0 space-y-2">
          <h2 className="font-display text-lg font-bold text-bronze-400">{title}</h2>
          {error && <p className="break-words text-sm text-ink">{error.message}</p>}
          {retry && (
            <button
              type="button"
              onClick={retry}
              className="mt-2 rounded-sm border border-bronze-500/60 bg-frame px-3 py-1.5 text-sm font-medium text-ink transition hover:border-bronze-400 hover:text-bronze-300"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon = "info", title, children }: { icon?: Parameters<typeof Icon>[0]["name"]; title: string; children?: ReactNode }) {
  return (
    <div className="wow-frame border-dashed p-6 text-center">
      <Icon name={icon} className="mx-auto h-6 w-6 text-bronze-500/80" />
      <h2 className="mt-2 font-display text-base font-bold text-bronze-400">{title}</h2>
      {children && <div className="mt-1 text-sm text-bronze-300/70">{children}</div>}
    </div>
  );
}

/** Small "coming in Pn" ribbon for placeholder pages. */
export function PhaseNote({ phase, children }: { phase: string; children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-horde-500/30 bg-horde-700/40 px-3 py-1 text-xs text-bronze-300">
      <span className="font-bold uppercase tracking-wider">{phase}</span>
      <span className="text-ink">{children}</span>
    </p>
  );
}
