/**
 * Baseline of the unoptimized click path. Names stay stable so later phases
 * re-run the same three benches: stepStatusAll, toggle, guideCompletion.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, test } from "vitest";
import type { Guide, QuestInfo, Step } from "../../data/schema";
import { guideCompletion } from "../position";
import { createMemoryStorage, createProfileEngine, setStepPickQuestCatalog } from "../profileStore";
import { countsInProgress } from "../stepRequirement";
import { createProfileEvaluator } from "../visibility";

const dataDir = fileURLToPath(new URL("../../../public/data/", import.meta.url));

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

const guideFiles = readdirSync(join(dataDir, "guides")).filter((name) => name.endsWith(".json"));
const guides = guideFiles.map((name) => readJson<Guide>(join(dataDir, "guides", name)));
const allSteps: Step[] = guides.flatMap((g) => g.steps);
const largest = guides.reduce((best, g) => (g.steps.length > best.steps.length ? g : best));

const questList = readJson<QuestInfo[]>(join(dataDir, "quests-min.json"));
const quests = new Map(questList.map((q) => [q.id, q]));
const questStepsRaw = readJson<Record<string, string[]>>(join(dataDir, "quest-steps.json"));
const questSteps = new Map<number, readonly string[]>();
for (const [key, ids] of Object.entries(questStepsRaw)) {
  const id = Number(key);
  if (Number.isFinite(id) && Array.isArray(ids)) questSteps.set(id, ids);
}

setStepPickQuestCatalog(quests);

const engine = createProfileEngine({
  storage: createMemoryStorage(),
  now: () => 1_700_000_000_000,
  id: () => "bench-profile",
  stepsForQuest: (questId) => questSteps.get(questId) ?? [],
});
engine.setKnownSteps(allSteps);
engine.setStepsForQuest((questId) => questSteps.get(questId) ?? []);
engine.noteGuides(guides);
engine.create({ name: "Bench", race: "Orc", cls: "Warrior" });

const profile = engine.active()!;
const vis = createProfileEvaluator({
  race: profile.race,
  cls: profile.cls,
  routeStyle: engine.routeStyle,
  role: profile.role,
  dungeons: profile.options.dungeons ?? false,
  showOptional: profile.options.showOptional,
  hideDone: profile.options.hideDone ?? false,
  isDone: (id) => engine.isDone(id, quests),
  stepStatus: (step) => engine.stepStatus(step, quests),
  revision: engine.revision(),
});

const steps = largest.steps;
const toggleStep = steps.find((s) => engine.stepStatus(s, quests).status !== "not_applicable") ?? steps[0]!;
const counts = (step: Step) => countsInProgress(engine.requirement(step, quests));
const isDone = (id: string) => engine.isDone(id, quests);

describe(`click path (${largest.slug}, ${steps.length} steps, corpus ${allSteps.length})`, () => {
  // Vitest 5 moved `bench` off the module onto the test context. The three
  // registration names stay the comparison keys for later phases.
  test("baselines", { timeout: 180_000 }, async ({ bench }) => {
    const stepStatusAll = bench("stepStatusAll", () => {
      for (const step of steps) engine.stepStatus(step, quests);
    });
    const toggle = bench("toggle", () => {
      engine.toggle(toggleStep.id, toggleStep, quests);
      engine.toggle(toggleStep.id, toggleStep, quests);
    });
    const guideCompletionBench = bench("guideCompletion", () => {
      guideCompletion(largest, isDone, vis, counts);
    });

    const [statusResult, toggleResult, completionResult] = await Promise.all([
      stepStatusAll.run(),
      toggle.run(),
      guideCompletionBench.run(),
    ]);

    const row = (result: { throughput: { mean: number }; latency: { mean: number } }) => ({
      hz: result.throughput.mean,
      meanMs: result.latency.mean,
    });
    console.log(
      `CLICK_PATH_BASELINE ${JSON.stringify({
        guide: largest.slug,
        stepCount: steps.length,
        totalSteps: allSteps.length,
        results: {
          stepStatusAll: row(statusResult),
          toggle: row(toggleResult),
          guideCompletion: row(completionResult),
        },
      })}`,
    );
  });
});
