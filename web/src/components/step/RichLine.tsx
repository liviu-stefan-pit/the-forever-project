import { Fragment, type ReactNode } from "react";
import type { RichText } from "../../data/schema";
import { KIND_CLASS, tokenizeLine, type IconGlyph } from "../../lib/richtext";
import { Icon } from "../ui/Icon";

function Glyph({ glyph, src }: { glyph: IconGlyph; src: string }) {
  if (glyph === "chat") {
    return (
      <span className="mr-1 inline-flex translate-y-[2px] text-bronze-500/80" title="Talk">
        <Icon name="chat" className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span
      className="mx-0.5 inline-flex h-4 w-4 translate-y-[3px] items-center justify-center rounded-[4px] border border-bronze-500/40 bg-gradient-to-br from-bronze-900/80 to-frame text-bronze-400"
      title={glyph === "item" ? `Icon ${src}` : src}
      aria-hidden="true"
    >
      <Icon name="gem" className="h-2.5 w-2.5" strokeWidth={2.4} />
    </span>
  );
}

/** A phrase to draw differently where the line says it (a quest name the step acts on). */
export interface LineHighlight {
  label: string;
  render: (text: string) => ReactNode;
}

/** Splits plain text at the first unused occurrence of each highlight (longest wins at the same spot). */
function highlightText(text: string, marks: readonly LineHighlight[], used: Set<number>, key: string): ReactNode[] {
  const lower = text.toLowerCase();
  let best: { at: number; idx: number } | null = null;
  marks.forEach((m, idx) => {
    if (used.has(idx) || !m.label) return;
    const at = lower.indexOf(m.label.toLowerCase());
    if (at < 0) return;
    if (!best || at < best.at || (at === best.at && m.label.length > marks[best.idx]!.label.length)) best = { at, idx };
  });
  if (!best) return [text];
  const { at, idx } = best as { at: number; idx: number };
  used.add(idx);
  const end = at + marks[idx]!.label.length;
  return [
    text.slice(0, at),
    <Fragment key={`${key}-m${idx}`}>{marks[idx]!.render(text.slice(at, end))}</Fragment>,
    ...highlightText(text.slice(end), marks, used, `${key}-r`),
  ];
}

/** One line of guide rich text (coloured segments, item names, glyphs, links). */
export function RichLine({ line, className = "", marks }: { line: RichText; className?: string; marks?: readonly LineHighlight[] }) {
  const tokens = tokenizeLine(line);
  const used = new Set<number>();
  return (
    <span className={className}>
      {tokens.map((t, i) => {
        switch (t.type) {
          case "icon":
            return <Glyph key={i} glyph={t.glyph} src={t.src} />;
          case "item":
            return (
              <span key={i} data-kind="item" className={`font-semibold ${t.kind ? KIND_CLASS[t.kind] : "text-ink"}`}>
                [{t.text}]
              </span>
            );
          case "link":
            return t.href ? (
              <a
                key={i}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-bronze-300 underline decoration-horde-500/40 underline-offset-2 transition hover:text-bronze-400 hover:decoration-bronze-400"
              >
                {t.text}
                <Icon name="external" className="h-3 w-3" />
              </a>
            ) : (
              <span key={i} className="text-bronze-300/70">
                {t.text}
              </span>
            );
          case "text": {
            const body = marks?.length ? highlightText(t.text, marks, used, String(i)) : t.text;
            return t.kind ? (
              <span key={i} data-kind={t.kind} className={`font-medium ${KIND_CLASS[t.kind]}`}>
                {body}
              </span>
            ) : (
              <span key={i}>{body}</span>
            );
          }
        }
      })}
    </span>
  );
}
