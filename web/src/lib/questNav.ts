export function questHref(
  id: number,
  loc: { pathname: string; search: string },
  stepId?: string,
): string {
  if (loc.pathname.startsWith("/guide/")) {
    const raw = loc.search.startsWith("?") ? loc.search.slice(1) : loc.search;
    const p = new URLSearchParams(raw);
    p.set("quest", String(id));
    if (stepId) p.set("step", stepId);
    return `${loc.pathname}?${p.toString()}`;
  }
  return `/quest/${id}`;
}

export function closeQuestHref(loc: { pathname: string; search: string }): string {
  const raw = loc.search.startsWith("?") ? loc.search.slice(1) : loc.search;
  const p = new URLSearchParams(raw);
  p.delete("quest");
  const q = p.toString();
  return q ? `${loc.pathname}?${q}` : loc.pathname;
}
