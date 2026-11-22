import { describe, expect, it } from "vitest";
import { liveSilverpineProfile } from "../src/state/fixtures/liveSilverpine.ts";
import { auditRequirements } from "../src/state/requirementAudit.ts";
import { loadAuditInputs } from "./breadcrumb-audit.ts";

describe("breadcrumb audit", () => {
  it("live fixture and synthetic scenarios produce zero violations", () => {
    const { guides, quests } = loadAuditInputs();
    const result = auditRequirements(guides, quests, liveSilverpineProfile());
    const sample = result.violations.slice(0, 15).map((v) => `${v.guide} ${v.route} ${v.stepId} ${v.scenario} ${v.rule} ${v.detail}`);
    expect(sample, sample.join("\n")).toEqual([]);
    expect(result.violations).toEqual([]);
  }, 30_000);
});
