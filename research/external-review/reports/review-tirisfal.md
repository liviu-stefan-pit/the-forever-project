# Tirisfal 1-12 route review

Route: `research/nova/v2/tirisfal-1-12.json` (read only). Checked against `content/questie-db` and `contracts/route-v2.schema.json`.

**FAIL**

- `tirisfal-1-12:126` (91282): `classes` is Paladin only, but there is no race filter, so the step shows for every race. Paladin is Undead only. Add `"filter": {"any": [[{"race": "Undead"}]]}` (same shape as `tirisfal-1-12:008`).
- `tirisfal-1-12:127` (94427): same missing Undead filter. Add `"filter": {"any": [[{"race": "Undead"}]]}`.
- `tirisfal-1-12:128` (94434): same missing Undead filter. Add `"filter": {"any": [[{"race": "Undead"}]]}`.
- `tirisfal-1-12:129` (94435): same missing Undead filter. Add `"filter": {"any": [[{"race": "Undead"}]]}`.
- `tirisfal-1-12:130` (94436): same missing Undead filter. Add `"filter": {"any": [[{"race": "Undead"}]]}`.
- `tirisfal-1-12:131` (94438): same missing Undead filter. Add `"filter": {"any": [[{"race": "Undead"}]]}`.
- `tirisfal-1-12:132` (94440): same missing Undead filter. Questie `races` on 94440 is the Horde mask, not 16, so the step must not stay open to other races. Add `"filter": {"any": [[{"race": "Undead"}]]}`.
- `tirisfal-1-12:133` (94441): same missing Undead filter. Add `"filter": {"any": [[{"race": "Undead"}]]}`.
