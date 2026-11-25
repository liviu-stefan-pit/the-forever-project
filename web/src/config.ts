/**
 * Site configuration. `COFFEE_URL` is the optional "Buy me a coffee" link in the footer
 * (DESIGN.md §8). Leave it empty and the link is hidden. Never put a placeholder URL here.
 */
export const COFFEE_URL = "";

/** Public site name (landing page, top bar, info pages, document titles). */
export const SITE_NAME = "The Forever Project";

/** Default document title; matches `<title>` in index.html. */
export const SITE_TITLE = `${SITE_NAME} — WoW Forever leveling guide`;

/** Public source repository. */
export const REPO_URL = "https://github.com/liviu-stefan-pit/the-forever-project";
export const ISSUES_URL = `${REPO_URL}/issues`;
export const RELEASES_URL = `${REPO_URL}/releases`;
export const SECURITY_URL = `${REPO_URL}/security`;
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;
export const PRIVACY_URL = `${REPO_URL}/blob/main/PRIVACY.md`;

/** Who runs the site (GDPR controller) and the contact for privacy, takedown and AdventureLog zips. */
export const MAINTAINER_NAME = "Liviu-Stefan Petroaia";
export const CONTACT_EMAIL = "liviustefan.petroaia@gmail.com";

/** Addon downloads: the release workflow keeps these "latest" tags pointing at the newest zip. */
export const GUIDEWEBEXPORT_ZIP_URL = `${RELEASES_URL}/download/guidewebexport-latest/GuideWebExport.zip`;
export const ADVENTURELOG_ZIP_URL = `${RELEASES_URL}/download/adventurelog-latest/AdventureLog.zip`;

/** The Horde dashboard. `/` is the faction landing page. */
export const HORDE_HOME = "/horde";
