/**
 * Reset window scroll when the user moves to a different page.
 * Search-param-only changes (e.g. `/guide/foo?step=…`) must not reset —
 * the guide reader owns that scroll (and uses preventScrollReset).
 */
export function pathForScrollReset(pathname: string): string {
  const cut = pathname.search(/[?#]/);
  return cut >= 0 ? pathname.slice(0, cut) : pathname;
}

export function resetScrollIfPathChanged(
  prevPathname: string | undefined,
  pathname: string,
  scrollTo: (x: number, y: number) => void = (x, y) => {
    window.scrollTo(x, y);
  },
): boolean {
  const from = prevPathname === undefined ? undefined : pathForScrollReset(prevPathname);
  const to = pathForScrollReset(pathname);
  if (from !== undefined && from !== to) {
    scrollTo(0, 0);
    return true;
  }
  return false;
}
