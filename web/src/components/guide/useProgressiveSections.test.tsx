import { act, createElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import type { SectionBlock } from "../../lib/grouping";
import { useProgressiveSections } from "./useProgressiveSections";

let doc: { createElement: (tag: string) => unknown } | null = null;

function el(tag: string) {
  const node: Record<string, unknown> = {
    tagName: String(tag).toUpperCase(),
    nodeType: 1,
    namespaceURI: "http://www.w3.org/1999/xhtml",
    childNodes: [] as unknown[],
    style: {},
    attributes: {} as Record<string, string>,
    ownerDocument: null as unknown,
    parentNode: null as unknown,
    textContent: "",
    setAttribute(k: string, v: string) {
      (node.attributes as Record<string, string>)[k] = String(v);
    },
    getAttribute(k: string) {
      return (node.attributes as Record<string, string>)[k];
    },
    removeAttribute(k: string) {
      delete (node.attributes as Record<string, string>)[k];
    },
    appendChild(c: { parentNode: unknown }) {
      (node.childNodes as unknown[]).push(c);
      c.parentNode = node;
      return c;
    },
    removeChild(c: { parentNode: unknown }) {
      node.childNodes = (node.childNodes as unknown[]).filter((x) => x !== c);
      c.parentNode = null;
      return c;
    },
    insertBefore(c: { parentNode: unknown }, ref: unknown) {
      const kids = node.childNodes as unknown[];
      const i = kids.indexOf(ref);
      if (i < 0) kids.push(c);
      else kids.splice(i, 0, c);
      c.parentNode = node;
      return c;
    },
    addEventListener() {},
    removeEventListener() {},
    getBoundingClientRect() {
      return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
    },
  };
  node.ownerDocument = doc;
  return node;
}

function installDom() {
  class HTMLIFrameElement {}
  const document = {
    nodeType: 9,
    documentElement: null as unknown,
    activeElement: null,
    defaultView: null as unknown,
    createElement: el,
    createElementNS: (_ns: string, tag: string) => el(tag),
    createTextNode: (s: string) => ({ nodeType: 3, textContent: String(s), parentNode: null, ownerDocument: null as unknown, childNodes: [] }),
    querySelectorAll: () => [],
    getElementById: () => null,
    addEventListener() {},
    removeEventListener() {},
  };
  const windowObj = {
    document,
    HTMLIFrameElement,
    addEventListener() {},
    removeEventListener() {},
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
    innerHeight: 800,
    scrollY: 0,
    scrollBy() {},
    requestAnimationFrame: (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number,
    cancelAnimationFrame: (id: number) => clearTimeout(id),
    matchMedia: () => ({ matches: false }),
  };
  doc = document;
  document.defaultView = windowObj;
  document.documentElement = el("html");
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.assign(globalThis, {
    window: windowObj,
    document,
    HTMLIFrameElement,
    HTMLElement: class {},
    Node: class {},
    Element: class {},
    ResizeObserver,
    IntersectionObserver,
    requestAnimationFrame: windowObj.requestAnimationFrame,
    cancelAnimationFrame: windowObj.cancelAnimationFrame,
    getComputedStyle: windowObj.getComputedStyle,
  });
  return document.createElement("div");
}

function textOf(node: { nodeType?: number; textContent?: string; childNodes?: unknown[] }): string {
  const kids = node.childNodes ?? [];
  if (node.nodeType === 3 || kids.length === 0) return node.textContent ?? "";
  return kids.map((c) => textOf(c as typeof node)).join("");
}

const block = (id: string, stepId: string): SectionBlock => ({ id, section: undefined, steps: [{ id: stepId } as SectionBlock["steps"][number]] });

let setSlug: ((slug: string) => void) | null = null;
let setLayoutKey: ((key: string) => void) | null = null;
let setCurrentId: ((id: string) => void) | null = null;
let setTick: ((fn: (n: number) => number) => void) | null = null;

function Probe() {
  const [slug, set] = useState("alpha");
  const [layoutKey, setLk] = useState("route");
  const [overrideCurrent, setOverride] = useState<string | undefined>(undefined);
  const [, setBump] = useState(0);
  setSlug = set;
  setLayoutKey = setLk;
  setCurrentId = setOverride;
  setTick = setBump;
  const blocks =
    slug === "alpha"
      ? [block("alpha-0", "alpha:1"), block("alpha-1", "alpha:2"), block("alpha-2", "alpha:3")]
      : [block("beta-0", "beta:1")];
  const order = blocks.flatMap((b) => b.steps.map((s) => s.id));
  const currentId = overrideCurrent ?? (slug === "alpha" ? "alpha:3" : "beta:1");
  const progressive = useProgressiveSections({
    slug,
    layoutKey,
    blocks,
    order,
    currentId,
    allStepIds: order,
    visibleIn: () => 1,
  });
  const title = slug === "alpha" ? "Alpha guide" : "Beta guide";
  return createElement(
    "div",
    null,
    createElement("h1", null, title),
    ...blocks.map((b, i) =>
      progressive.isMounted(i)
        ? createElement("section", { key: b.id, ref: (el: HTMLDivElement | null) => progressive.setMeasureNode(b.id, el) }, b.id)
        : createElement(
            "div",
            {
              key: b.id,
              ref: (el: HTMLDivElement | null) => progressive.setMeasureNode(b.id, el),
              "data-section-placeholder": b.id,
            },
            "placeholder",
          ),
    ),
  );
}

async function mountAllAlphaSections() {
  await act(async () => {
    setCurrentId!("alpha:1");
  });
  await act(async () => {
    setCurrentId!("alpha:2");
  });
  await act(async () => {
    setCurrentId!("alpha:3");
  });
}

function renderProbe() {
  const host = installDom();
  const root = createRoot(host as unknown as Element);
  return { host, root };
}

describe("useProgressiveSections slug change", () => {
  let root: Root | null = null;
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    setSlug = null;
    setLayoutKey = null;
    setCurrentId = null;
    setTick = null;
  });

  it("shows the second guide after a slug change that starts at step 1", async () => {
    const rendered = renderProbe();
    root = rendered.root;
    await act(async () => {
      root!.render(createElement(Probe));
    });
    expect(textOf(rendered.host as never)).toContain("alpha-2");

    await act(async () => {
      setSlug!("beta");
    });
    const text = textOf(rendered.host as never);
    expect(text).toContain("Beta guide");
    expect(text).toContain("beta-0");
    expect(text).not.toContain("placeholder");
    expect(text).not.toContain("alpha-2");
  });
});

describe("useProgressiveSections layoutKey", () => {
  let root: Root | null = null;
  let host: unknown;
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    setSlug = null;
    setLayoutKey = null;
    setCurrentId = null;
    setTick = null;
  });

  it("does not collapse the mounted set on a revision-only re-render", async () => {
    const rendered = renderProbe();
    root = rendered.root;
    host = rendered.host;
    await act(async () => {
      root!.render(createElement(Probe));
    });
    await mountAllAlphaSections();
    const mounted = textOf(host as never);
    expect(mounted).toContain("alpha-0");
    expect(mounted).toContain("alpha-1");
    expect(mounted).toContain("alpha-2");

    await act(async () => {
      setTick!((n) => n + 1);
    });
    const after = textOf(host as never);
    expect(after).toContain("alpha-0");
    expect(after).toContain("alpha-1");
    expect(after).toContain("alpha-2");
    expect(after).not.toContain("placeholder");
  });

  it("resets toward the anchor section when layoutKey changes", async () => {
    const rendered = renderProbe();
    root = rendered.root;
    host = rendered.host;
    await act(async () => {
      root!.render(createElement(Probe));
    });
    await mountAllAlphaSections();
    expect(textOf(host as never)).toContain("alpha-0");
    expect(textOf(host as never)).toContain("alpha-1");
    expect(textOf(host as never)).toContain("alpha-2");

    await act(async () => {
      setLayoutKey!("route:hidedone");
    });
    const text = textOf(host as never);
    expect(text).toContain("alpha-2");
    expect(text).toContain("placeholder");
    expect(text).not.toContain("alpha-0");
    expect(text).not.toContain("alpha-1");
  });
});
