#!/usr/bin/env node
/**
 * Apply Phase 3 band patches onto research/catalog/horde-40-60.route.json
 *
 *   node research/horde-40-60/tools/apply-band-patches.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const MONOLITH = join(ROOT, "research/catalog/horde-40-60.route.json");
const PATCH_DIR = join(ROOT, "research/horde-40-60/patches");
const PATCH_FILES = ["band-40-49.json", "band-49-55.json", "band-55-60.json"];

/** Known Step fields the patches may set even if this step does not already have them. */
const EXTRA_ALLOWED_KEYS = new Set(["classes", "roles"]);
/** Do not invent a group toggle on steps that do not already have these keys. */
const BLOCKED_NEW_KEYS = new Set(["group", "groupOff", "soloClasses", "checkpoint"]);
const PROTECTED_ACTIONS = new Set(["accept", "turnin", "complete", "fly"]);
const SPECIAL_SET_KEYS = new Set(["tags", "tips", "actions", "elite", "routes"]);

const summary = {
  patched: 0,
  inserted: 0,
  skipped: 0,
  errors: [],
};

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function collectStepKeys(steps) {
  const keys = new Set();
  for (const step of steps) {
    for (const key of Object.keys(step)) keys.add(key);
  }
  return keys;
}

function indexById(steps) {
  const map = new Map();
  for (let i = 0; i < steps.length; i++) map.set(steps[i].id, i);
  return map;
}

function tipTexts(tips) {
  return (Array.isArray(tips) ? tips : []).map((t) => t?.text).filter((t) => typeof t === "string");
}

function mergeTips(existing, patchTips) {
  const oldTips = Array.isArray(existing) ? existing : [];
  if (oldTips.length === 0) return patchTips;
  const patchSet = new Set(tipTexts(patchTips));
  const oldTexts = tipTexts(oldTips);
  const includesPrior = oldTexts.length > 0 && oldTexts.every((t) => patchSet.has(t));
  if (includesPrior) return patchTips;
  const oldSet = new Set(oldTexts);
  const extra = patchTips.filter((t) => !oldSet.has(t?.text));
  return [...oldTips, ...extra];
}

function mergeActions(oldActions, newActions) {
  const oldA = Array.isArray(oldActions) ? oldActions : [];
  const newA = Array.isArray(newActions) ? newActions : [];
  const oldProt = oldA.filter((a) => PROTECTED_ACTIONS.has(a?.type));
  const droppedProt = oldProt.filter((a) => !newA.some((n) => n?.type === a.type));
  if (droppedProt.length) {
    const newGotos = newA.filter((a) => a?.type === "goto");
    const restNew = newA.filter((a) => a?.type !== "goto");
    return [...newGotos, ...droppedProt, ...restNew];
  }
  const addingGotoToFly =
    oldA.some((a) => a?.type === "fly") &&
    newA.some((a) => a?.type === "goto") &&
    newA.some((a) => a?.type === "fly");
  if (addingGotoToFly) return newA;
  return null;
}

function applySet(step, set, knownKeys, stepId) {
  if (!set || typeof set !== "object" || Array.isArray(set)) {
    summary.errors.push(`${stepId}: set is not an object`);
    summary.skipped += 1;
    return false;
  }
  let changed = false;
  for (const [key, value] of Object.entries(set)) {
    if (key === "tags") {
      step.tags = { ...(step.tags || {}), ...(value && typeof value === "object" ? value : {}) };
      changed = true;
      continue;
    }
    if (key === "tips") {
      step.tips = mergeTips(step.tips, value);
      changed = true;
      continue;
    }
    if (key === "actions") {
      const merged = mergeActions(step.actions, value);
      if (merged == null) {
        summary.errors.push(`${stepId}: actions not replaced (not a goto-on-fly add)`);
        continue;
      }
      step.actions = merged;
      changed = true;
      continue;
    }
    if (key === "elite") {
      step.elite = value;
      changed = true;
      continue;
    }
    if (key === "routes") {
      step.routes = value;
      changed = true;
      continue;
    }
    const alreadyOnStep = Object.prototype.hasOwnProperty.call(step, key);
    if (BLOCKED_NEW_KEYS.has(key) && !alreadyOnStep) {
      summary.errors.push(`${stepId}: skipped blocked key ${key}`);
      continue;
    }
    const allowed =
      alreadyOnStep || knownKeys.has(key) || EXTRA_ALLOWED_KEYS.has(key);
    if (!allowed) {
      summary.errors.push(`${stepId}: skipped unknown key ${key}`);
      continue;
    }
    step[key] = value;
    changed = true;
  }
  return changed;
}

function applyPatchFile(route, patch, knownKeys) {
  const steps = route.steps;
  for (const entry of patch.stepPatches || []) {
    const stepId = entry?.stepId;
    if (!stepId) {
      summary.errors.push("stepPatches entry missing stepId");
      summary.skipped += 1;
      continue;
    }
    const idx = steps.findIndex((s) => s.id === stepId);
    if (idx < 0) {
      summary.errors.push(`missing step ${stepId}`);
      summary.skipped += 1;
      continue;
    }
    const changed = applySet(steps[idx], entry.set, knownKeys, stepId);
    if (changed) summary.patched += 1;
    else summary.skipped += 1;
  }

  const insertedAfter = new Map();
  for (const entry of patch.insertAfter || []) {
    const afterStepId = entry?.afterStepId;
    const step = entry?.step;
    if (!afterStepId) {
      summary.errors.push("insertAfter missing afterStepId");
      summary.skipped += 1;
      continue;
    }
    if (!step || typeof step !== "object") {
      summary.errors.push(`insertAfter ${afterStepId}: missing step`);
      summary.skipped += 1;
      continue;
    }
    if (!step.id || !Array.isArray(step.actions) || !Array.isArray(step.sources) || typeof step.verified !== "boolean") {
      summary.errors.push(`insert ${step.id || "?"}: new step must have id, actions, sources, verified`);
      summary.skipped += 1;
      continue;
    }
    if (steps.some((s) => s.id === step.id)) {
      summary.skipped += 1;
      continue;
    }
    const afterIdx = steps.findIndex((s) => s.id === afterStepId);
    if (afterIdx < 0) {
      summary.errors.push(`insertAfter missing afterStepId ${afterStepId}`);
      summary.skipped += 1;
      continue;
    }
    let insertAt = afterIdx + 1;
    while (insertAt < steps.length && insertedAfter.get(steps[insertAt].id) === afterStepId) {
      insertAt += 1;
    }
    steps.splice(insertAt, 0, step);
    insertedAfter.set(step.id, afterStepId);
    summary.inserted += 1;
  }
}

function main() {
  const route = loadJson(MONOLITH);
  if (!Array.isArray(route.steps)) {
    throw new Error("monolith has no steps array");
  }
  const knownKeys = collectStepKeys(route.steps);
  for (const extra of EXTRA_ALLOWED_KEYS) knownKeys.add(extra);

  for (const name of PATCH_FILES) {
    const patch = loadJson(join(PATCH_DIR, name));
    applyPatchFile(route, patch, knownKeys);
  }

  const text = `${JSON.stringify(route, null, 2)}\n`;
  let roundtrip;
  try {
    roundtrip = JSON.parse(text);
  } catch (err) {
    throw new Error(`refusing to write: JSON.parse failed (${err.message})`);
  }
  if (JSON.stringify(roundtrip) !== JSON.stringify(route)) {
    throw new Error("refusing to write: JSON.parse roundtrip mismatch");
  }
  writeFileSync(MONOLITH, text, "utf8");

  console.log("apply-band-patches");
  console.log(`  patched:  ${summary.patched}`);
  console.log(`  inserted: ${summary.inserted}`);
  console.log(`  skipped:  ${summary.skipped}`);
  console.log(`  errors:   ${summary.errors.length}`);
  for (const err of summary.errors) console.log(`    - ${err}`);
}

main();
