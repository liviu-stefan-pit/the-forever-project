import { Link } from "react-router";
import { dataOf, useQuestSteps } from "../../data/hooks";
import type { QuestMap, ZoneMap } from "../../data/loader";
import type { QuestInfo } from "../../data/schema";
import { prettifySlug } from "../../lib/levels";
import { namedChain, questLeg, questMapSection, wowheadQuestUrl } from "../../lib/questView";
import { ZoneMapSlot } from "../map/ZoneMapSlot";
import { Icon } from "../ui/Icon";
import { QuestLink } from "./QuestLink";

export function QuestDetails({
  quest,
  quests,
  zones,
}: {
  quest: QuestInfo;
  quests?: QuestMap;
  zones?: ZoneMap;
}) {
  const stepIds = dataOf(useQuestSteps())?.get(quest.id) ?? [];
  const wowhead = wowheadQuestUrl(quest);
  const pre = namedChain([...new Set([...quest.pre.single, ...quest.pre.group])], quests);
  const follow = quest.next != null ? namedChain([quest.next], quests) : [];
  const section = questMapSection(quest);
  const leg = questLeg(quest, section.mapId);
  const zone = zones?.get(section.mapId);
  const giver = (label: string, list: QuestInfo["start"]) => (
    <div className="rounded-sm border border-bronze-500/50 bg-black/5 p-3">
      <div className="text-[11px] uppercase tracking-wider text-bronze-500/80">{label}</div>
      {list.length === 0 && <p className="mt-1 text-sm opacity-60">Unknown</p>}
      {list.map((g) => (
        <div key={`${g.kind}-${g.id}`} className="mt-1 text-sm">
          <span className="text-rt-friendly">{g.name}</span>
          {g.at[0] && (
            <span className="opacity-70">
              {" "}
              · {g.at[0].zone} {g.at[0].x.toFixed(1)}, {g.at[0].y.toFixed(1)}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Level", quest.level],
          ["Requires", quest.reqLevel],
          ["XP", quest.xp ?? "—"],
          ["Zone", quest.zone ?? "—"],
        ].map(([k, v]) => (
          <div key={k as string}>
            <dt className="text-[11px] uppercase tracking-wider text-bronze-500/80">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      {quest.objectivesText.length > 0 && (
        <p className="text-sm leading-relaxed">{quest.objectivesText.join(" ")}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {giver("Starts at", quest.start)}
        {giver("Ends at", quest.end)}
      </div>

      {quest.objectives.length > 0 && (
        <section>
          <h3 className="mb-1.5 text-[11px] uppercase tracking-wider text-bronze-500/80">Objectives</h3>
          <ul className="space-y-1.5 text-sm">
            {quest.objectives.map((o, i) => (
              <li key={`${o.kind}-${o.id ?? i}-${o.name}`}>
                <span className="font-medium">
                  {o.count != null ? `${o.count}× ` : ""}
                  {o.name}
                </span>
                <span className="ml-1.5 text-[11px] uppercase tracking-wider opacity-60">{o.kind}</span>
                {o.drops && o.drops.length > 0 && (
                  <ul className="mt-0.5 text-xs opacity-70">
                    {o.drops.map((d) => (
                      <li key={d.npcId}>
                        Drop: {d.name}
                        {d.rate != null ? ` · ${d.rate}%` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(pre.length > 0 || follow.length > 0) && (
        <section className="grid gap-3 sm:grid-cols-2">
          {pre.length > 0 && (
            <div>
              <h3 className="mb-1.5 text-[11px] uppercase tracking-wider text-bronze-500/80">Prerequisites</h3>
              <ul className="space-y-1">
                {pre.map((c) => (
                  <li key={c.id}>
                    <QuestLink id={c.id} className="text-sm text-bronze-400 hover:text-bronze-300">
                      {c.name}
                    </QuestLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {follow.length > 0 && (
            <div>
              <h3 className="mb-1.5 text-[11px] uppercase tracking-wider text-bronze-500/80">Follow-up</h3>
              <ul className="space-y-1">
                {follow.map((c) => (
                  <li key={c.id}>
                    <QuestLink id={c.id} className="text-sm text-bronze-400 hover:text-bronze-300">
                      {c.name}
                    </QuestLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <ZoneMapSlot
        section={section}
        zone={zone}
        variant="panel"
        stepCount={0}
        mode="quest"
        questPins={leg.pins}
        routePoints={leg.path}
      />

      {stepIds.length > 0 && (
        <section>
          <h3 className="mb-1.5 text-[11px] uppercase tracking-wider text-bronze-500/80">Used by steps</h3>
          <ul className="flex flex-wrap gap-1.5">
            {stepIds.map((sid) => {
              const slug = sid.split(":")[0]!;
              return (
                <li key={sid}>
                  <Link
                    to={`/guide/${slug}?step=${encodeURIComponent(sid)}`}
                    className="inline-flex items-center gap-1 rounded-sm border border-bronze-500/60 px-2 py-0.5 text-xs hover:border-bronze-400"
                  >
                    {prettifySlug(slug)} <Icon name="arrowRight" className="h-3 w-3" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {wowhead && (
        <a
          href={wowhead}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-bronze-400 hover:text-bronze-300"
        >
          Wowhead Classic <Icon name="external" className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
