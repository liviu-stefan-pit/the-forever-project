import qrcode from "qrcode-generator";
import { useState } from "react";
import { dataOf, useGuideIndex } from "../data/hooks";
import type { Profile } from "../data/schema";
import { copyText } from "../lib/clipboard";
import { buildPayload, encodePayload, MAX_QR_URL } from "../lib/transferCode";
import { Icon } from "./ui/Icon";

/** Link that opens `#/transfer` with the packed profile, on this same site. */
export function transferUrl(code: string): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/transfer?d=${code}`;
}

/** QR code as an SVG (dark modules on white, with the quiet zone scanners need). */
function QrSvg({ text }: { text: string }) {
  const qr = qrcode(0, "L");
  qr.addData(text, "Byte");
  qr.make();
  const n = qr.getModuleCount();
  const pad = 4;
  let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + pad} ${r + pad}h1v1h-1z`;
  const size = n + pad * 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="QR code with your profile" className="h-auto w-full max-w-[320px] rounded-sm" shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#fff" />
      <path d={d} fill="#000" />
    </svg>
  );
}

/**
 * Profile page: move this profile to a phone by scanning a QR code. The whole profile travels in the
 * link (nothing is uploaded), so it is a one-off copy, not a live sync.
 */
export function PhoneTransferPanel({ profile }: { profile: Profile }) {
  const index = dataOf(useGuideIndex());
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const supported = typeof CompressionStream !== "undefined";

  const make = async () => {
    if (!index) return;
    setError(null);
    setCopied(false);
    try {
      const link = transferUrl(await encodePayload(buildPayload(profile, index)));
      if (link.length > MAX_QR_URL) {
        setUrl(null);
        setError("This profile is too big for a QR code. Use Export here and Import JSON profile on the phone.");
        return;
      }
      setUrl(link);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <section className="wow-frame p-5" aria-labelledby="phone-transfer">
      <h2 id="phone-transfer" className="font-display text-lg font-bold text-bronze-400">
        Open on your phone
      </h2>
      <p className="mt-1 text-sm text-muted">
        Use your phone as a second screen while you play. Scan the code with the phone camera to copy <strong className="text-ink">{profile.name}</strong>,
        with its ticks and settings, to the phone. Nothing is uploaded: the profile is inside the link. Scan again later to bring the phone up to date.
      </p>
      {!supported ? (
        <p className="mt-3 text-sm text-rt-warn">This browser cannot build the code. Use Export and Import JSON profile instead.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
          {url ? (
            <QrSvg text={url} />
          ) : (
            <button
              type="button"
              onClick={() => void make()}
              disabled={!index}
              className="press inline-flex min-h-touch items-center gap-2 self-start rounded-sm border border-bronze-500/60 bg-frame px-3 py-2 text-sm font-semibold text-ink hover:border-bronze-400 disabled:opacity-50"
            >
              <Icon name="link" className="h-4 w-4" /> Show QR code
            </button>
          )}
          {url && (
            <div className="space-y-2 text-sm text-muted">
              <p>The code is a snapshot of right now. Ticks you make on the phone stay on the phone.</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => setCopied(await copyText(url))}
                  className="press inline-flex min-h-touch items-center gap-2 rounded-sm border border-stroke px-3 text-ink hover:border-bronze-500"
                >
                  <Icon name="copy" className="h-4 w-4" /> {copied ? "Link copied" : "Copy link"}
                </button>
                <button type="button" onClick={() => void make()} className="press inline-flex min-h-touch items-center gap-2 rounded-sm border border-stroke px-3 text-ink hover:border-bronze-500">
                  <Icon name="loop" className="h-4 w-4" /> Refresh
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-rt-warn">{error}</p>}
    </section>
  );
}
