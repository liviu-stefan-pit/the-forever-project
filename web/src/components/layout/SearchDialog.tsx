/**
 * MiniSearch over the prebuilt `search-index.json` (guides, steps, quests, NPCs, zones).
 * Ctrl+K and "/" open this dialog from the shell.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { searchResultPath } from "../../search/query";
import type { SearchDoc, SearchKind } from "../../search/types";
import { querySearch, searchPhase, startSearchWorker, subscribeSearch } from "../../search/workerClient";
import { useUi } from "../../state/ui";
import { Icon, type IconName } from "../ui/Icon";

const KIND_ICON: Record<SearchKind, IconName> = {
  guide: "map",
  step: "chevronRight",
  quest: "scroll",
  npc: "user",
  zone: "pin",
};

export function SearchDialog() {
  const ui = useUi();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [hits, setHits] = useState<SearchDoc[]>([]);
  const [phase, setPhase] = useState(searchPhase);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef<Element | null>(null);

  useEffect(() => {
    restoreFocus.current = document.activeElement;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      (restoreFocus.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  useEffect(() => {
    startSearchWorker();
    return subscribeSearch(() => setPhase(searchPhase()));
  }, []);

  useEffect(() => {
    if (phase.status !== "ready") return;
    let alive = true;
    void querySearch(q).then((next) => {
      if (alive) setHits(next);
    });
    return () => {
      alive = false;
    };
  }, [q, phase.status]);

  const go = (h: SearchDoc | undefined) => {
    if (!h) return;
    ui.closeSearch();
    navigate(searchResultPath(h));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-3 pt-[12vh]" role="presentation">
      <div className="fade-in absolute inset-0 bg-canvas/75 backdrop-blur-sm" onClick={ui.closeSearch} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="wow-frame panel-animate relative w-full max-w-xl overflow-hidden shadow-2xl shadow-black/60"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            ui.closeSearch();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setSel((v) => Math.min(hits.length - 1, v + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSel((v) => Math.max(0, v - 1));
          } else if (e.key === "Enter") {
            e.preventDefault();
            go(hits[sel]);
          } else if (e.key === "Tab") {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
      >
        <div className="flex items-center gap-3 border-b border-stroke px-4">
          <Icon name="search" className="h-4 w-4 shrink-0 text-bronze-500/80" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            placeholder="Search guides, steps, quests, NPCs, zones…"
            aria-label="Search query"
            className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-bronze-500/60 focus:outline-none"
          />
          <kbd className="rounded-sm border border-stroke px-1.5 text-[10px] text-bronze-500/80">Esc</kbd>
        </div>
        <ul className="parchment max-h-[50vh] overflow-y-auto p-2" role="listbox" aria-label="Results">
          {phase.status === "error" && phase.error && (
            <li className="px-3 py-6 text-center text-sm text-rt-enemy">{phase.error}</li>
          )}
          {phase.status !== "error" && phase.status !== "ready" && (
            <li className="px-3 py-6 text-center text-sm text-parchment-ink/70">Loading index…</li>
          )}
          {phase.status === "ready" && hits.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-parchment-ink/70">{q.trim() ? "No matches." : "Type to search."}</li>
          )}
          {hits.map((h, i) => (
            <li key={`${h.kind}:${h.id}`} role="option" aria-selected={i === sel}>
              <button
                type="button"
                onMouseEnter={() => setSel(i)}
                onClick={() => go(h)}
                className={`flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition ${i === sel ? "bg-horde-500/20 text-parchment-ink" : "text-parchment-ink"}`}
              >
                <Icon name={KIND_ICON[h.kind]} className={`h-4 w-4 shrink-0 ${h.kind === "guide" ? "text-horde-400" : "text-parchment-ink/60"}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{h.title}</span>
                  <span className="block truncate text-[11px] text-parchment-ink/70">
                    {h.kind}
                    {h.guide ? ` · ${h.guide}` : ""}
                    {h.text && h.text !== h.title ? ` · ${h.text}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-stroke px-4 py-2 text-[11px] text-bronze-500/80">
          <span>↑↓ select · Enter open</span>
          <span>Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}
