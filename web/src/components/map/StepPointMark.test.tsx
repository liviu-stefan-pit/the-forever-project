import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi, type Mock } from "vitest";
import type { StepPoint } from "../../lib/stepPoints";
import { StepPointMark } from "./StepPointMark";

const pt = (state: StepPoint["state"]): StepPoint => ({ x: 1, y: 1, state, stepIds: ["a", "b"], ns: [3, 4] });
const html = (p: StepPoint) => renderToStaticMarkup(createElement(StepPointMark, { point: p }));

describe("StepPointMark", () => {
  it("current step: 36px ring with a pulse and a 'Current' label", () => {
    const h = html(pt("current"));
    expect(h).toContain('data-step-point="current"');
    expect(h).toContain("ring-ping");
    expect(h).toContain("h-9 w-9");
    expect(h).toContain("Current: Steps #3, #4");
  });

  it("done steps: a check mark and 'done' in the label", () => {
    const h = html(pt("done"));
    expect(h).toContain('data-step-point="done"');
    expect(h).toContain("bg-done");
    expect(h).toContain("<path");
    expect(h).toContain(", done");
    expect(h).not.toContain("ring-ping");
  });

  it("other steps: a plain dot", () => {
    const h = html(pt("todo"));
    expect(h).toContain('data-step-point="todo"');
    expect(h).not.toContain("bg-done");
  });

  it("clicking a mark selects its first step", () => {
    const onSelect: Mock = vi.fn();
    const el = StepPointMark({ point: pt("done"), onSelect }) as { props: { onClick: () => void } };
    el.props.onClick();
    expect(onSelect).toHaveBeenCalledWith("a");
  });

  it("the pulse is turned off for reduced motion", () => {
    const css = readFileSync(fileURLToPath(new URL("../../index.css", import.meta.url)), "utf-8");
    const reduced = css.slice(css.indexOf("prefers-reduced-motion"));
    expect(reduced).toMatch(/\.ring-ping\s*\{[^}]*display:\s*none/);
  });
});
