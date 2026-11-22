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

/** One line of guide rich text (coloured segments, item names, glyphs, links). */
export function RichLine({ line, className = "" }: { line: RichText; className?: string }) {
  const tokens = tokenizeLine(line);
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
          case "text":
            return t.kind ? (
              <span key={i} data-kind={t.kind} className={`font-medium ${KIND_CLASS[t.kind]}`}>
                {t.text}
              </span>
            ) : (
              <span key={i}>{t.text}</span>
            );
        }
      })}
    </span>
  );
}
