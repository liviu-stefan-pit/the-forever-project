# Security policy

## Supported versions

| Component | Supported |
|---|---|
| The website (latest `main` and the live site) | Yes |
| GuideWebExport, latest release | Yes |
| AdventureLog, latest release | Yes |
| Older addon releases and old commits | No, please update first |

## Reporting a vulnerability

Please **do not open a public issue** for a security problem.

Report it privately through GitHub: open the repository's **Security** tab and click
**Report a vulnerability** (GitHub private vulnerability reporting), or go to
https://github.com/liviu-stefan-pit/the-forever-project/security/advisories/new.

Please include what is affected (site page, addon, script), how to reproduce it, and what an attacker could
do with it. We will acknowledge the report as soon as we can, keep you informed while we fix it, and credit
you in the advisory if you would like.

## Scope

The site is static and stores everything in your browser, so the most relevant problems are things like
cross-site scripting through route data or uploaded files, the local dev server's game-sync endpoint reading
files it should not, and addon or export-script behaviour that writes outside its own files.
