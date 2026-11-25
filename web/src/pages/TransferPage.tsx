/**
 * `/transfer?d=<code>` — the phone side of "Open on your phone": shows what the link carries and adds
 * it as a profile on this device.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ErrorState, Skeleton } from "../components/ui/States";
import { Icon } from "../components/ui/Icon";
import { HORDE_HOME } from "../config";
import { dataOf, guideTitleOf, useGuideIndex } from "../data/hooks";
import { decodePayload, payloadToProfileJson, type TransferPayload } from "../lib/transferCode";
import { useProfileApi } from "../state/profile";

export function TransferPage() {
  const [params] = useSearchParams();
  const code = params.get("d") ?? "";
  const index = dataOf(useGuideIndex());
  const api = useProfileApi();
  const navigate = useNavigate();
  const [payload, setPayload] = useState<TransferPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    if (!code) {
      setError("This link has no profile in it.");
      return;
    }
    decodePayload(code).then(
      (p) => live && setPayload(p),
      (e: unknown) => live && setError(e instanceof Error ? e.message : "This transfer link is not valid."),
    );
    return () => {
      live = false;
    };
  }, [code]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-3 py-8 sm:px-6">
        <ErrorState title="Could not open this profile" error={new Error(error)} />
      </div>
    );
  }
  if (!payload || !index) {
    return (
      <div className="mx-auto max-w-xl space-y-3 px-3 py-8 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const sameBuild = payload.build === index.generatedAt;
  const doneCount = payload.done.match(/[0-9a-f]{2}/g)?.reduce((n, h) => n + popcount(parseInt(h, 16)), 0) ?? 0;
  const existing = api.profiles.filter((p) => p.name === payload.name && p.race === payload.race && p.cls === payload.cls);

  const add = () => {
    try {
      api.importParsed(payloadToProfileJson(payload, index, Date.now()));
      navigate(payload.cur ? `/guide/${payload.cur[0]}?step=${encodeURIComponent(payload.cur[1])}` : HORDE_HOME, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 px-3 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-bronze-400">Add this profile</h1>
      <div className="wow-frame space-y-1.5 p-5 text-sm text-ink">
        <p className="text-lg font-semibold">{payload.name}</p>
        <p className="text-muted">
          {payload.race} {payload.cls}
          {payload.level ? ` · level ${payload.level}` : ""} · {payload.route === "speedrun" ? "Speedrun" : "Balanced"}
          {payload.opt.d ? " · dungeons on" : ""}
        </p>
        <p>{doneCount.toLocaleString()} steps done</p>
        {payload.cur && <p className="text-muted">Picks up at {guideTitleOf(index, payload.cur[0])}</p>}
      </div>
      {!sameBuild ? (
        <p className="flex gap-2 rounded-sm border border-rt-warn/60 bg-frame/60 px-3 py-2 text-sm text-ink">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-rt-warn" />
          <span>
            The guide data on the two devices is not the same version, so the ticks would land on the wrong steps. Reload the site on the PC,
            press <strong>Show QR code</strong> again and scan the new code.
          </span>
        </p>
      ) : (
        <>
          {existing.length > 0 && (
            <p className="text-sm text-muted">
              This device already has a profile called {payload.name}. Adding makes a second copy; you can delete the old one on the{" "}
              <Link to="/profile" className="text-bronze-400 hover:text-bronze-300">
                Profile
              </Link>{" "}
              page.
            </p>
          )}
          <button
            type="button"
            onClick={add}
            className="press inline-flex min-h-touch items-center gap-2 rounded-sm border border-bronze-500 bg-horde-500 px-5 py-2.5 font-semibold text-ink hover:bg-horde-400"
          >
            <Icon name="download" className="h-4 w-4" /> Add to this device
          </button>
        </>
      )}
    </div>
  );
}

function popcount(n: number): number {
  let c = 0;
  for (; n; n &= n - 1) c++;
  return c;
}
