/**
 * Pins next-step bugs against the live Silverpine snapshot.
 * Expected behavior is the post-fix behavior. Several cases already hold and are kept.
 * Class is incidental: the character is an Undead Priest only so race/class filters
 * hide the same steps the app hides. Assertions are about quest progress, breadcrumbs,
 * and non-trackable steps, which apply to every class.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { Guide, Profile, QuestInfo, Step } from "../data/schema";
import { ZoneSection } from "../components/guide/ZoneSection";
import { pickCurrentStepId, pickNextOpenSteps } from "../lib/guideList";
import { splitBySection } from "../lib/grouping";
import { guideNearestInput, nearestGotoStep } from "../lib/profileHints";
import { sectionStepPoints } from "../lib/stepPoints";
import { isQuestExcluded, lookupQuest } from "./questAvailability";
import { navReducer } from "./keyboard";
import { guideCompletion } from "./position";
import { applyToggle, isStepDone, stepPickShouldSkip, stepStatus, type StepsForQuest } from "./questProgress";
import { createMemoryStorage, createProfileEngine, setStepPickQuestCatalog } from "./profileStore";
import { createProfileEvaluator } from "./visibility";
import { liveSilverpine, liveSilverpineProfile } from "./fixtures/liveSilverpine";
import type { GameExport } from "./luaExport";

/** Numeric race masks from web/scripts/prereq-check.ts (`RACE_MASK`). Not imported: that file is a script. */
const RACE_MASK = { Orc: 2, Undead: 16, Tauren: 32, Troll: 128 } as const;

const dataDir = fileURLToPath(new URL("../../public/data/", import.meta.url));
const readJson = (rel: string) => JSON.parse(readFileSync(dataDir + rel, "utf8"));

const quests = new Map((readJson("quests-min.json") as QuestInfo[]).map((q) => [q.id, q]));
const silverpine = readJson("guides/silverpine-11-15.json") as Guide;
const tirisfal = readJson("guides/tirisfal-1-12.json") as Guide;

const none: StepsForQuest = () => [];
const PROVE = "silverpine-11-15:007";
const PROVE_SR = "silverpine-11-15:sr06";
/** Accept Lost Deathstalkers (:004) was compacted into the Prove Your Worth accept. */
const LOST_ACCEPT = "silverpine-11-15:003";
const LOST_ACCEPT_ABSORBED = "silverpine-11-15:004";
/** Turn in Lost Deathstalkers; the following Wild Hearts accept (:010) was compacted into this card. */
const LOST_TURNIN = "silverpine-11-15:009";
/** Speedrun accept :sr04 was compacted into the Prove Your Worth accept. */
const LOST_ACCEPT_SR = "silverpine-11-15:sr03";
const LOST_TURNIN_SR = "silverpine-11-15:sr07";
/** Last Deathknell town stop (hand-ins + trainer). Every quest on it is done in the snapshot. */
const TRAINER = "tirisfal-1-12:040";
/** First open Tirisfal step: the Agamand Mills field step, which also accepts A Letter Undelivered (361, never taken). */
const TIRISFAL_NEXT = "tirisfal-1-12:096";
/** Balanced exit to Silverpine: a travel step with no actions. */
const TIRISFAL_EXIT = "tirisfal-1-12:119";
const BARRENS_EXIT = "silverpine-11-15:036";

function stepById(guide: Guide, id: string): Step {
  const step = guide.steps.find((s) => s.id === id) ?? guide.steps.find((s) => s.mergedIds?.includes(id));
  if (!step) throw new Error(`missing step ${id}`);
  return step;
}

/** Same visible list GuideReader builds: profile filters, route style, dungeons off, nothing revealed. */
function visibleSteps(guide: Guide, profile: Profile, routeStyle: "balanced" | "speedrun"): Step[] {
  const vis = createProfileEvaluator({
    race: profile.race,
    cls: profile.cls,
    routeStyle,
    showOptional: profile.options.showOptional,
    hideDone: false,
    dungeons: false,
  });
  return guide.steps.filter((s) => vis.step(s).visible);
}

/** GuideReader's pick: deep link, then cursor, skipping done / blocked / not_applicable / passed travel. */
function pick(steps: readonly Step[], profile: Profile, extra: { deepStep?: string; cursorStep?: string } = {}) {
  const order = steps.map((s) => s.id);
  const byId = new Map(steps.map((s) => [s.id, s]));
  const isDone = (id: string) => isStepDone(profile, id, none, byId.get(id), quests);
  const shouldSkip = (id: string) => {
    const step = byId.get(id);
    if (!step) return false;
    const status = stepStatus(profile, step, none, quests).status;
    return stepPickShouldSkip(step, steps, isDone, status);
  };
  return pickCurrentStepId(order, { ...extra, isDone, shouldSkip });
}

function engine() {
  let n = 0;
  return createProfileEngine({
    storage: createMemoryStorage(),
    now: () => 1000,
    id: () => `id-${++n}`,
  });
}

function liveExport(): GameExport {
  return {
    lastCharacter: "Throgar Ashfang-",
    schemaVersion: 4,
    characters: [
      {
        key: "Throgar Ashfang-",
        name: liveSilverpine.name,
        race: liveSilverpine.race,
        cls: liveSilverpine.cls,
        level: liveSilverpine.level,
        schemaVersion: 4,
        questLogOk: true,
        completedQuests: [...liveSilverpine.completed],
        questLog: liveSilverpine.questLog.map((entry) => ({
          id: entry.id,
          complete: entry.complete === true,
          objectives: (entry.objectives ?? []).map((o) => ({
            text: o.text,
            finished: o.finished === true,
            numFulfilled: o.numFulfilled,
            numRequired: o.numRequired,
          })),
        })),
        bind: liveSilverpine.hearth,
        bindOk: true,
        taxi: liveSilverpine.taxi.map((node) => ({ ...node })),
        taxiOk: true,
        position: { ...liveSilverpine.position },
        positionOk: true,
      },
    ],
  };
}

describe("live Silverpine snapshot", () => {
  const profile = liveSilverpineProfile();
  const balanced = visibleSteps(silverpine, profile, "balanced");
  const speedrun = visibleSteps(silverpine, profile, "speedrun");

  it("loads the catalog facts the assertions rely on", () => {
    expect(liveSilverpine.completed).toHaveLength(108);
    expect(lookupQuest(quests, 428)?.breadcrumbFor).toBe(429);
    expect(lookupQuest(quests, 363)?.breadcrumbFor).toBe(364);
    expect(profile.quests[429]).toBe("done");
    expect(profile.quests[363]).toBe("done");
    expect(profile.quests[364]).toBe("done");
    expect(profile.quests[421]).toBeUndefined();
    expect(stepById(silverpine, PROVE).actions.some((a) => a.type === "complete" && a.questId === 421)).toBe(true);
    expect(stepById(silverpine, PROVE_SR).actions.some((a) => a.type === "complete" && a.questId === 421)).toBe(true);
    expect(stepById(silverpine, LOST_ACCEPT).actions.some((a) => a.type === "accept" && a.questId === 428)).toBe(true);
    expect(stepById(silverpine, LOST_ACCEPT).id).toBe(LOST_ACCEPT);
    expect(stepById(silverpine, LOST_ACCEPT_ABSORBED).id).toBe(LOST_ACCEPT);
  });

  it("keeps class-filtered steps hidden on the visible route", () => {
    const ids = visibleSteps(tirisfal, profile, "balanced").map((s) => s.id);
    expect(ids).not.toContain("tirisfal-1-12:008");
    expect(ids).toContain(TRAINER);
  });

  it("picks Prove Your Worth on the visible Silverpine route when nothing is pinned", () => {
    expect(pick(balanced, profile)).toBe(PROVE);
    expect(pick(speedrun, profile)).toBe(PROVE_SR);
  });

  it("advances a stored cursor that sits on the excluded Lost Deathstalkers accept", () => {
    expect(pick(balanced, profile, { cursorStep: LOST_ACCEPT })).toBe(PROVE);
    expect(pick(speedrun, profile, { cursorStep: LOST_ACCEPT_SR })).toBe(PROVE_SR);
  });

  it("advances a stale ?step= deep link off the excluded Lost Deathstalkers accept", () => {
    expect.soft(pick(balanced, profile, { deepStep: LOST_ACCEPT, cursorStep: LOST_ACCEPT })).toBe(PROVE);
    expect.soft(pick(speedrun, profile, { deepStep: LOST_ACCEPT_SR })).toBe(PROVE_SR);
  });

  it("moves the saved cursor forward when sync applies this snapshot over step :004", () => {
    const e = engine();
    e.create({ name: liveSilverpine.name, race: liveSilverpine.race, cls: liveSilverpine.cls, level: 1 });
    setStepPickQuestCatalog(quests);
    e.setKnownSteps(silverpine.steps);
    e.setCurrent({ guide: silverpine.slug, step: LOST_ACCEPT });
    const result = e.syncFromGame(liveExport());
    expect(result.ok).toBe(true);
    expect(e.active()?.quests[429]).toBe("done");
    expect(e.active()?.questLog?.some((q) => q.questId === 421)).toBe(true);
    expect(e.current).toEqual({ guide: silverpine.slug, step: PROVE });
  });

  it("excludes the Lost Deathstalkers breadcrumb while the merged accept stays open", () => {
    // 428 is still excluded once 429 is logged. The surviving card stays open because it also accepts 421.
    const accept = stepById(silverpine, LOST_ACCEPT);
    const info = lookupQuest(quests, 428);
    expect(info).toBeDefined();
    for (const complete of [0, 1] as const) {
      const logged: Profile = {
        ...liveSilverpineProfile({
          quests: {},
          questLog: [{ questId: 429, complete, objectives: [{ finished: complete === 1, numFulfilled: complete, numRequired: 1 }] }],
        }),
      };
      expect.soft(stepStatus(logged, accept, none, quests).status).toBe("open");
      expect.soft(isQuestExcluded(info!, logged)).toBe(true);
      expect.soft(isStepDone(logged, accept.id, none, accept, quests)).toBe(false);
      expect.soft(pick(visibleSteps(silverpine, logged, "balanced"), logged, { deepStep: LOST_ACCEPT, cursorStep: LOST_ACCEPT })).toBe(
        LOST_ACCEPT,
      );
    }
  });

  it("shows a completed breadcrumb as done", () => {
    // 363 (Rude Awakening) is Undead starting content. The check is breadcrumb + completed, for every class.
    // Town stop 1 accepts and turns in 363, then accepts 364.
    const stop = stepById(tirisfal, "tirisfal-1-12:001");
    expect.soft(stepStatus(profile, stop, none, quests).status).toBe("done");
    expect.soft(isStepDone(profile, stop.id, none, stop, quests)).toBe(true);
  });

  it("leaves trainer and travel steps open when a later quest step is already done", () => {
    // Tirisfal's trainer lines now sit on town stops with quests, so its open travel step is the exit.
    const exit = stepById(tirisfal, TIRISFAL_EXIT);
    const runNorth = stepById(silverpine, "silverpine-11-15:008");
    const leave = stepById(silverpine, BARRENS_EXIT);
    expect(isStepDone(profile, exit.id, none, exit, quests)).toBe(false);
    expect(isStepDone(profile, runNorth.id, none, runNorth, quests)).toBe(false);
    expect(isStepDone(profile, leave.id, none, leave, quests)).toBe(false);
  });

  it("does not pick the trainer or a goto that sits before a later done quest step", () => {
    // A cursor or deep link on a passed town stop (:040, all quests done) moves on to the first open step,
    // the Agamand Mills field step (:096), which is open because 361 was never accepted.
    const steps = visibleSteps(tirisfal, profile, "balanced");
    expect.soft(pick(steps, profile)).toBe(TIRISFAL_NEXT);
    expect.soft(pick(steps, profile, { cursorStep: TRAINER, deepStep: TRAINER })).toBe(TIRISFAL_NEXT);
  });

  it("dashboard next-steps skip a passed trainer or goto without marking them done", () => {
    const dashboardNext = (guide: Guide, startId: string) => {
      const steps = visibleSteps(guide, profile, "balanced");
      const byId = new Map(guide.steps.map((s) => [s.id, s]));
      const isDone = (id: string) => isStepDone(profile, id, none, byId.get(id), quests);
      return pickNextOpenSteps(
        steps.map((s) => s.id),
        {
          startId,
          isDone,
          shouldSkip: (id) => {
            const step = byId.get(id);
            if (!step) return false;
            return stepPickShouldSkip(step, guide.steps, isDone, stepStatus(profile, step, none, quests).status);
          },
          limit: 5,
        },
      );
    };
    const runNorth = stepById(silverpine, "silverpine-11-15:008");
    expect(isStepDone(profile, runNorth.id, none, runNorth, quests)).toBe(false);
    const fromTrainer = dashboardNext(tirisfal, TRAINER);
    expect(fromTrainer[0]).toBe(TIRISFAL_NEXT);
    expect(fromTrainer).not.toContain(TRAINER);
    const fromLost = dashboardNext(silverpine, LOST_ACCEPT);
    expect(fromLost[0]).toBe(PROVE);
    expect(fromLost).not.toContain(LOST_ACCEPT);
    expect(fromLost).not.toContain(runNorth.id);
  });

  it("picks the nearest still-open Sepulcher step on the visible route, at or after the current step", () => {
    // TopBar passes every step of the guide. nearestGotoStep cannot see the visible route or the cursor.
    // The picker stays on the visible balanced route at or after Prove Your Worth (:007).
    // :036 is the Sepulcher flight toward the Barrens; it now sits at the end of the route, so a later
    // done quest no longer skips it, and it is the closest open goto to the player in the Sepulcher.
    const isDone = (id: string) => isStepDone(profile, id, none, stepById(silverpine, id), quests);
    const input = guideNearestInput(silverpine.steps, isDone, {
      visibleIds: balanced.map((s) => s.id),
      status: (step) => stepStatus(profile, step, none, quests).status,
    });
    expect(nearestGotoStep(input, liveSilverpine.position, { currentId: pick(balanced, profile) })).toBe(BARRENS_EXIT);
  });

  it("hides not-applicable Lost Deathstalkers steps when hide-done is on", () => {
    const isDone = (id: string) => isStepDone(profile, id, none, stepById(silverpine, id), quests);
    const visFor = (routeStyle: "balanced" | "speedrun") =>
      createProfileEvaluator({
        race: profile.race,
        cls: profile.cls,
        routeStyle,
        showOptional: profile.options.showOptional,
        hideDone: true,
        dungeons: false,
        isDone,
        stepStatus: (step) => stepStatus(profile, step, none, quests),
      });
    const balancedVis = visFor("balanced");
    const speedrunVis = visFor("speedrun");
    for (const id of [LOST_ACCEPT, LOST_TURNIN] as const) {
      const v = balancedVis.step(stepById(silverpine, id));
      expect.soft(v.visible, id).toBe(false);
      expect.soft(v.reason === "done" || v.reason === ("not_applicable" as typeof v.reason), id).toBe(true);
    }
    for (const id of [LOST_ACCEPT_SR, LOST_TURNIN_SR] as const) {
      const v = speedrunVis.step(stepById(silverpine, id));
      expect.soft(v.visible, id).toBe(false);
      expect.soft(v.reason === "done" || v.reason === ("not_applicable" as typeof v.reason), id).toBe(true);
    }
  });

  it("renders the merged Lost Deathstalkers accept as a done Prove Your Worth card", () => {
    const vis = createProfileEvaluator({
      race: profile.race,
      cls: profile.cls,
      routeStyle: "balanced",
      showOptional: profile.options.showOptional,
      hideDone: false,
      dungeons: false,
    });
    const isDone = (id: string) => isStepDone(profile, id, none, stepById(silverpine, id), quests);
    const block = splitBySection(silverpine).find((b) => b.steps.some((s) => s.id === LOST_ACCEPT));
    if (!block) throw new Error("missing section for the merged 428 accept");
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(ZoneSection, {
        guide: silverpine,
        block,
        position: { index: 1, total: 1 },
        zones: undefined,
        vis,
        isShown: (s: Step) => vis.step(s).visible,
        isDone,
        currentId: PROVE,
        questName: () => "",
        lineVisible: () => true,
        onToggle: () => {},
        onSelect: () => {},
        onJump: () => {},
        onStopSelect: () => {},
        onReveal: () => {},
        quests,
        progressProfile: profile,
        stepStatus: (step, lookup) => stepStatus(profile, step, none, lookup),
        stepsForQuest: none,
        resolveStep: (id) => silverpine.steps.find((s) => s.id === id),
      })),
    );
    const start = html.indexOf(`data-step-id="${LOST_ACCEPT}"`);
    expect(start).toBeGreaterThanOrEqual(0);
    const next = html.indexOf("data-step-id=", start + 1);
    const chunk = html.slice(start, next === -1 ? undefined : next);
    expect.soft(chunk).toContain('data-requirement="done"');
    expect.soft(chunk).toContain('data-collapsed="false"');
    expect.soft(chunk).toContain('data-done="true"');
    expect.soft(chunk).toContain("Lost Deathstalkers");
    expect.soft(chunk).toContain("Prove Your Worth");
    expect.soft(chunk).toContain(`aria-label="Step ${stepById(silverpine, LOST_ACCEPT).n}, done"`);
    expect.soft(chunk.includes("Breadcrumb")).toBe(false);
    expect.soft(chunk.includes("Skipped")).toBe(false);
  });

  it("excludes not-applicable Lost Deathstalkers steps from balanced guide completion", () => {
    const vis = createProfileEvaluator({
      race: profile.race,
      cls: profile.cls,
      routeStyle: "balanced",
      showOptional: profile.options.showOptional,
      hideDone: false,
      dungeons: false,
    });
    const isDone = (id: string) => isStepDone(profile, id, none, stepById(silverpine, id), quests);
    const counts = (step: Step) => stepStatus(profile, step, none, quests).status !== "not_applicable";
    const full = guideCompletion(silverpine, isDone, vis, counts);
    // :004 is not its own row. Sepulcher hearth silverpine-11-15:w2-home-sepulcher is its own balanced row, so the guide is 80. :009 is done (428 turn-in plus Wild Hearts) and counts, so dropping it leaves 79.
    const withoutTurnin = guideCompletion(
      { ...silverpine, steps: silverpine.steps.filter((s) => s.id !== LOST_TURNIN) },
      isDone,
      vis,
      counts,
    );
    expect(full.total, "balanced steps include the Sepulcher hearth silverpine-11-15:w2-home-sepulcher").toBe(80);
    expect(withoutTurnin.total).toBe(79);
  });

  it("omits the not-applicable Lost Deathstalkers accept from map todo points", () => {
    const vis = createProfileEvaluator({
      race: profile.race,
      cls: profile.cls,
      routeStyle: "balanced",
      showOptional: profile.options.showOptional,
      hideDone: false,
      dungeons: false,
    });
    const block = splitBySection(silverpine).find((b) => b.steps.some((s) => s.id === LOST_ACCEPT));
    if (!block?.section) throw new Error("missing map section for the merged 428 accept");
    const points = sectionStepPoints({
      steps: block.steps,
      mapId: block.section.mapId,
      isShown: (s) => vis.step(s).visible,
      isDone: (id) => isStepDone(profile, id, none, stepById(silverpine, id), quests),
      omit: (step) => stepStatus(profile, step, none, quests).status === "not_applicable",
      currentId: PROVE,
      lineVisible: vis.line,
    });
    // :004 is not its own dot. :003 is the Prove Your Worth accept and is drawn; a shared cell may rank the dot as todo.
    expect.soft(points.some((p) => p.stepIds.includes(LOST_ACCEPT_ABSORBED))).toBe(false);
    expect.soft(points.some((p) => p.stepIds.includes(LOST_ACCEPT))).toBe(true);
  });

  it("j/k stop on the merged Lost Deathstalkers accept card", () => {
    const order = balanced.map((s) => s.id);
    const byId = new Map(balanced.map((s) => [s.id, s]));
    const isDone = (id: string) => isStepDone(profile, id, none, byId.get(id), quests);
    const shouldSkip = (id: string) => {
      const step = byId.get(id);
      if (!step) return false;
      return stepPickShouldSkip(step, silverpine.steps, isDone, stepStatus(profile, step, none, quests).status);
    };
    const ctx = { order, isDone, shouldSkip };
    const at = order.indexOf(LOST_ACCEPT);
    expect(at).toBeGreaterThan(0);
    expect(order).not.toContain(LOST_ACCEPT_ABSORBED);
    const before = order[at - 1]!;
    const after = order[at + 1]!;
    // :004 was absorbed into :003. That card is done (421 is in the log) and is a normal j/k stop.
    expect.soft(shouldSkip(LOST_ACCEPT)).toBe(false);
    expect.soft(navReducer(before, "next", ctx).current).toBe(LOST_ACCEPT);
    expect.soft(navReducer(LOST_ACCEPT, "next", ctx).current).toBe(after);
    expect.soft(navReducer(after, "prev", ctx).current).toBe(LOST_ACCEPT);
  });

  it("keeps a ?step= deep link off the done merged Lost Deathstalkers accept", () => {
    expect(pick(balanced, profile, { deepStep: LOST_ACCEPT, cursorStep: LOST_ACCEPT })).toBe(PROVE);
  });

  it("rewrites a stored cursor sitting on the merged :004 card when 429 is already done", () => {
    // :004 no longer exists. The cursor sits on :003 (Prove Your Worth + Lost Deathstalkers).
    // That card is done, so setCurrent and sync both advance to the Prove Your Worth complete step.
    const e = engine();
    e.create({ name: liveSilverpine.name, race: liveSilverpine.race, cls: liveSilverpine.cls, level: 1 });
    setStepPickQuestCatalog(quests);
    e.setKnownSteps(silverpine.steps);
    e.setCurrent({ guide: silverpine.slug, step: LOST_ACCEPT });
    const synced = e.syncFromGame(liveExport());
    expect(synced.ok).toBe(true);
    expect(e.current).toEqual({ guide: silverpine.slug, step: PROVE });
    e.setCurrent({ guide: silverpine.slug, step: LOST_ACCEPT });
    expect(pick(balanced, profile, { deepStep: LOST_ACCEPT, cursorStep: e.current?.step })).toBe(PROVE);
    expect(e.current).toEqual({ guide: silverpine.slug, step: PROVE });
  });
});

describe("not applicable without the live class", () => {
  const bare = (partial: Partial<Profile> = {}): Profile =>
    liveSilverpineProfile({
      quests: {},
      questLog: [],
      questLogSyncedAt: undefined,
      steps: {},
      ...partial,
    });

  it("keeps the merged Lost Deathstalkers accept required when nothing is done", () => {
    const accept = stepById(silverpine, LOST_ACCEPT);
    const fresh = bare();
    expect(stepStatus(fresh, accept, none, quests).status).toBe("open");
    expect(isStepDone(fresh, accept.id, none, accept, quests)).toBe(false);
  });

  it("keeps the merged accept open when only 429 is in the quest log", () => {
    // 428 is excluded, but the same card still accepts Prove Your Worth (421).
    const accept = stepById(silverpine, LOST_ACCEPT);
    const logged = bare({
      questLogSyncedAt: "2026-11-21T11:24:09.000Z",
      questLog: [{ questId: 429, complete: 0, objectives: [{ finished: false, numFulfilled: 0, numRequired: 1 }] }],
    });
    expect(stepStatus(logged, accept, none, quests).status).toBe("open");
    expect(isStepDone(logged, accept.id, none, accept, quests)).toBe(false);
  });

  it("keeps the merged accept open when 428 is in the quest log but 421 is not", () => {
    const accept = stepById(silverpine, LOST_ACCEPT);
    const turnin = stepById(silverpine, LOST_TURNIN);
    const logged = bare({
      questLogSyncedAt: "2026-11-21T11:24:09.000Z",
      questLog: [{ questId: 428, complete: 0 }],
    });
    expect(stepStatus(logged, accept, none, quests).status).toBe("open");
    expect(isStepDone(logged, accept.id, none, accept, quests)).toBe(false);
    const turninStatus = stepStatus(logged, turnin, none, quests).status;
    expect(turninStatus).not.toBe("not_applicable");
    expect(turninStatus === "open" || turninStatus === "blocked").toBe(true);
    expect(isStepDone(logged, turnin.id, none, turnin, quests)).toBe(false);
  });

  it("treats a race-mask mismatch as not applicable", () => {
    const questId = 900001;
    const info: QuestInfo = {
      id: questId,
      name: "Orc only",
      level: 1,
      reqLevel: 1,
      races: RACE_MASK.Orc,
      classes: 0,
      custom: false,
      start: [{ kind: "npc", id: 1, name: "NPC", at: [] }],
      end: [],
      objectivesText: [],
      objectives: [],
      pre: { group: [], single: [] },
      exclusiveTo: [],
      repeatable: false,
      inGuides: [],
    };
    const step: Step = {
      id: "race-mask:001",
      n: 1,
      tags: {},
      text: [],
      actions: [{ type: "accept", questId, label: "Accept orc quest" }],
      conditions: [],
    };
    const undead = bare({ race: "Undead", cls: "Warrior" });
    const lookup = new Map<number, QuestInfo>([[questId, info]]);
    expect.soft(stepStatus(undead, step, none, lookup).status).toBe("not_applicable");
    const vis = createProfileEvaluator({
      race: undead.race,
      cls: undead.cls,
      routeStyle: "balanced",
      showOptional: true,
      hideDone: true,
      dungeons: false,
      isDone: (id) => isStepDone(undead, id, none, id === step.id ? step : undefined, lookup),
      stepStatus: (candidate) => stepStatus(undead, candidate, none, lookup),
    });
    expect(vis.step(step).visible).toBe(false);
  });

  it("does not mark quest 428 done when the merged Lost Deathstalkers cards are clicked", () => {
    const before = bare({ quests: { 429: "done" } });
    const accept = stepById(silverpine, LOST_ACCEPT);
    expect(stepStatus(before, accept, none, quests).status).toBe("open");
    const afterAccept = applyToggle(before, accept.id, accept, { stepsForQuest: none, now: 20, quests });
    expect(afterAccept.steps[accept.id]).toEqual({ done: true, at: 20 });
    expect(afterAccept.quests[428]).not.toBe("done");
    const turnin = stepById(silverpine, LOST_TURNIN);
    expect(stepStatus(before, turnin, none, quests).status).toBe("done");
    const afterTurnin = applyToggle(before, turnin.id, turnin, { stepsForQuest: none, now: 20, quests });
    expect(afterTurnin.quests[428]).not.toBe("done");
  });
});
