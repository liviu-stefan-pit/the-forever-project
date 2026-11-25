/**
 * The site used hash routes (`/#/horde`) before it moved to plain paths (`/horde`). Bookmarks,
 * shared phone-transfer links and installed home-screen apps still carry the old form, so turn
 * `#/<path>?<query>#<anchor>` into `/<path>?<query>#<anchor>`.
 *
 * Imported first in main.tsx so it runs before router.tsx creates the router. A hash-only change
 * later (someone edits the address bar) does not reload the page, so it is handled on
 * `hashchange` too; the `popstate` tells the router the URL moved.
 */
function fromLegacyHash(): boolean {
  const { hash } = window.location;
  if (!hash.startsWith("#/")) return false;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  window.history.replaceState(window.history.state, "", `${base}${hash.slice(1)}`);
  return true;
}

fromLegacyHash();
window.addEventListener("hashchange", () => {
  if (fromLegacyHash()) window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
});
