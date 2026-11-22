/**
 * Full-screen animated background for the landing page: a warm Horde field and a cool Alliance
 * field meeting at a waving gold seam. Embers rise on the Horde side, frost motes drift on the
 * Alliance side, and whatever reaches the seam becomes a gold spark that runs along it.
 *
 * One 2D canvas, no libraries. The colour fields are drawn on a tiny offscreen canvas and scaled
 * up, which blurs the seam edge for free. Pauses with the tab (requestAnimationFrame), caps the
 * pixel ratio, scales the particle count to the screen, and draws one still frame when the
 * visitor prefers reduced motion.
 */
import { useEffect, useRef } from "react";
import { approach, particleBudget, seamSide, seamSlope, seamTarget, seamX, type Focus, type Seam } from "./fusion";

const EMBER = ["#ff7a3c", "#ffb347", "#e0b85a", "#c45c54", "#ff9a3c"];
const FROST = ["#9cc3f5", "#eef2f7", "#c9d3e0", "#5b8fd9", "#bcd7ff"];
const GOLD = ["#ffe9a3", "#e8d18a", "#fff4d0", "#e0b85a"];
const BASE_SCALE = 12;

/** 0 ember, 1 frost mote, 2 seam spark. */
type Kind = 0 | 1 | 2;
interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  kind: Kind;
  home: Kind;
  sprite: HTMLCanvasElement;
  depth: number;
  phase: number;
}

function sprite(color: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.18, color);
  r.addColorStop(0.45, `${color}55`);
  r.addColorStop(1, `${color}00`);
  g.fillStyle = r;
  g.fillRect(0, 0, 32, 32);
  return c;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)]!;

export function FusionBackground({ focus }: { focus: Focus }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const focusRef = useRef<Focus>(focus);
  const redrawRef = useRef<() => void>(() => {});
  focusRef.current = focus;

  useEffect(() => {
    redrawRef.current();
  }, [focus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const finePointer = window.matchMedia?.("(pointer: fine)").matches ?? false;
    const sprites = {
      ember: EMBER.map(sprite),
      frost: FROST.map(sprite),
      gold: GOLD.map(sprite),
    };
    const base = document.createElement("canvas");
    const bctx = base.getContext("2d")!;

    let w = 0;
    let h = 0;
    let t = 0;
    let seamFrac = 0.5;
    let seamReveal = 0;
    const seam: Seam = { cx: 0, cy: 0, slope: -0.2, amp: 18, t: 0 };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let parts: P[] = [];

    const syncSeam = () => {
      seam.cx = seamFrac * w;
      seam.cy = h / 2;
      seam.slope = seamSlope(w, h);
      seam.amp = Math.min(16, w * 0.015);
      seam.t = t;
    };

    const spawn = (p: P | undefined, home: Kind, anywhere: boolean): P => {
      const q = p ?? ({} as P);
      q.home = home;
      q.kind = home;
      q.age = 0;
      q.depth = rand(0.3, 1);
      q.phase = rand(0, Math.PI * 2);
      if (home === 0) {
        q.y = anywhere ? rand(0, h) : h + rand(0, 30) - Math.random() ** 3 * h * 0.6;
        const edge = seamX(seam, q.y) - 8;
        q.x = edge > 0 ? rand(-10, edge) : -20;
        q.vx = rand(4, 16);
        q.vy = -rand(22, 70);
        q.life = rand(4, 9);
        q.size = rand(3, 8);
        q.sprite = pick(sprites.ember);
      } else if (home === 1) {
        q.y = anywhere ? rand(0, h) : -rand(0, 30) + Math.random() ** 3 * h * 0.6;
        const edge = seamX(seam, q.y) + 8;
        q.x = edge < w ? rand(edge, w + 10) : w + 20;
        q.vx = -rand(5, 16);
        q.vy = rand(8, 28);
        q.life = rand(6, 12);
        q.size = rand(3, 7);
        q.sprite = pick(sprites.frost);
      } else {
        q.y = rand(0, h);
        q.x = seamX(seam, q.y) + rand(-6, 6);
        q.vx = 0;
        q.vy = rand(-80, 80);
        q.life = rand(1, 2.4);
        q.size = rand(2, 5);
        q.sprite = pick(sprites.gold);
      }
      if (anywhere) q.age = rand(0, q.life * 0.7);
      return q;
    };

    const toSpark = (p: P) => {
      p.kind = 2;
      p.age = 0;
      p.life = rand(1.1, 2.6);
      p.vx = p.vx * 0.3;
      p.vy = (p.home === 0 ? -1 : 1) * rand(40, 120);
      p.size *= rand(0.7, 1.1);
      p.sprite = pick(sprites.gold);
    };

    const populate = () => {
      const n = particleBudget(w, h);
      parts = [];
      for (let i = 0; i < n; i++) parts.push(spawn(undefined, 0, true));
      for (let i = 0; i < n; i++) parts.push(spawn(undefined, 1, true));
      for (let i = 0; i < Math.round(n / 6); i++) parts.push(spawn(undefined, 2, true));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      base.width = Math.ceil(w / BASE_SCALE) + 4;
      base.height = Math.ceil(h / BASE_SCALE) + 4;
      seamFrac = seamTarget(w, focusRef.current);
      syncSeam();
      populate();
    };

    const drawBase = () => {
      const s = 1 / BASE_SCALE;
      bctx.setTransform(s, 0, 0, s, 2, 2);
      const max = Math.max(w, h);
      // Alliance field: night blue, royal-blue bloom, cold silver light from the top right.
      const lin = bctx.createLinearGradient(0, 0, w, h);
      lin.addColorStop(0, "#0b1530");
      lin.addColorStop(1, "#060a14");
      bctx.fillStyle = lin;
      bctx.fillRect(-40, -40, w + 80, h + 80);
      let r = bctx.createRadialGradient(w * 0.78, h * 0.35, 0, w * 0.78, h * 0.35, max * 0.6);
      r.addColorStop(0, "rgba(31,78,156,0.42)");
      r.addColorStop(1, "rgba(31,78,156,0)");
      bctx.fillStyle = r;
      bctx.fillRect(-40, -40, w + 80, h + 80);
      r = bctx.createRadialGradient(w, 0, 0, w, 0, max * 0.55);
      r.addColorStop(0, "rgba(201,211,224,0.16)");
      r.addColorStop(1, "rgba(201,211,224,0)");
      bctx.fillStyle = r;
      bctx.fillRect(-40, -40, w + 80, h + 80);
      // Horde field, clipped to the left of the seam: warm black, blood-red bloom, forge glow below.
      bctx.save();
      bctx.beginPath();
      bctx.moveTo(-60, -60);
      for (let y = -60; y <= h + 60; y += 40) bctx.lineTo(seamX(seam, y), y);
      bctx.lineTo(-60, h + 60);
      bctx.closePath();
      bctx.clip();
      bctx.fillStyle = "#140b09";
      bctx.fillRect(-60, -60, w + 120, h + 120);
      r = bctx.createRadialGradient(w * 0.22, h * 0.35, 0, w * 0.22, h * 0.35, max * 0.6);
      r.addColorStop(0, "rgba(155,44,44,0.45)");
      r.addColorStop(1, "rgba(155,44,44,0)");
      bctx.fillStyle = r;
      bctx.fillRect(-60, -60, w + 120, h + 120);
      r = bctx.createRadialGradient(w * 0.1, h, 0, w * 0.1, h, max * 0.5);
      r.addColorStop(0, "rgba(224,148,58,0.22)");
      r.addColorStop(1, "rgba(224,148,58,0)");
      bctx.fillStyle = r;
      bctx.fillRect(-60, -60, w + 120, h + 120);
      bctx.restore();
      // The soft gold haze along the seam lives here too: scaling the tiny canvas up blurs it smoothly.
      const pulse = 0.85 + 0.15 * Math.sin(t * 1.5);
      bctx.globalCompositeOperation = "lighter";
      bctx.lineCap = "round";
      bctx.lineJoin = "round";
      bctx.beginPath();
      bctx.moveTo(seamX(seam, -60), -60);
      for (let y = -20; y <= h + 60; y += 40) bctx.lineTo(seamX(seam, y), y);
      for (const [width, alpha] of [
        [260, 0.07],
        [120, 0.12],
        [48, 0.2],
      ] as const) {
        const g = bctx.createLinearGradient(0, 0, 0, h);
        const a = alpha * pulse * seamReveal;
        g.addColorStop(0, `rgba(232,209,138,${a * 0.4})`);
        g.addColorStop(0.45, `rgba(232,209,138,${a})`);
        g.addColorStop(1, `rgba(224,184,90,${a * 0.35})`);
        bctx.strokeStyle = g;
        bctx.lineWidth = width;
        bctx.stroke();
      }
      bctx.globalCompositeOperation = "source-over";
    };

    const drawSeam = (reveal: number) => {
      const end = -40 + (h + 80) * reveal;
      const pulse = 0.85 + 0.15 * Math.sin(t * 1.5);
      const passes: [number, number, string][] = [
        [7, 0.16, "255,233,163"],
        [2.5, 0.38, "255,244,208"],
        [1, 0.6, "255,255,255"],
      ];
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(seamX(seam, -40), -40);
      for (let y = -16; y <= end; y += 24) ctx.lineTo(seamX(seam, y), y);
      for (const [width, alpha, rgb] of passes) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        const a = alpha * pulse;
        g.addColorStop(0, `rgba(${rgb},${a * 0.35})`);
        g.addColorStop(0.45, `rgba(${rgb},${a})`);
        g.addColorStop(1, `rgba(${rgb},${a * 0.3})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = width;
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawParticles = () => {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const p of parts) {
        const fadeIn = Math.min(1, p.age / 0.6);
        const fadeOut = Math.min(1, (p.life - p.age) / (p.life * 0.35));
        let a = Math.max(0, Math.min(fadeIn, fadeOut));
        if (p.kind === 0) a *= 0.7 + 0.3 * Math.sin(t * 9 + p.phase);
        else if (p.kind === 1) a *= 0.55 + 0.45 * Math.sin(t * 2.6 + p.phase);
        else a *= 0.85 + 0.15 * Math.sin(t * 14 + p.phase);
        if (a <= 0.01) continue;
        ctx.globalAlpha = a * (0.45 + 0.55 * p.depth);
        const s = p.size * (p.kind === 2 ? 1.6 : 1) * (0.6 + 0.6 * p.depth);
        const ox = pointer.x * 14 * p.depth;
        const oy = pointer.y * 10 * p.depth;
        ctx.drawImage(p.sprite, p.x + ox - s, p.y + oy - s, s * 2, s * 2);
      }
      ctx.restore();
    };

    const step = (dt: number) => {
      const f = focusRef.current;
      seamFrac = approach(seamFrac, seamTarget(w, f), dt, 0.45);
      pointer.x = approach(pointer.x, pointer.tx, dt, 0.6);
      pointer.y = approach(pointer.y, pointer.ty, dt, 0.6);
      syncSeam();
      const emberBoost = f === "horde" ? 1.35 : 1;
      const frostSlow = f === "alliance" ? 0.6 : 1;
      const damp = Math.exp(-dt * 2.2);
      for (const p of parts) {
        p.age += dt;
        if (p.kind === 0) {
          p.x += (p.vx + Math.sin(t * 2 + p.phase) * 12) * dt * emberBoost;
          p.y += p.vy * dt * emberBoost;
          if (seamSide(seam, p.x, p.y) > -3) toSpark(p);
        } else if (p.kind === 1) {
          p.x += (p.vx + Math.sin(t * 1.3 + p.phase) * 10) * dt * frostSlow;
          p.y += p.vy * dt * frostSlow;
          if (seamSide(seam, p.x, p.y) < 3) toSpark(p);
        } else {
          // Sparks are pulled onto the seam and run along it, leaning with it.
          p.vx = (p.vx - seamSide(seam, p.x, p.y) * 7 * dt) * damp;
          p.x += (p.vx + seam.slope * p.vy) * dt;
          p.y += p.vy * dt;
        }
        if (p.age >= p.life || p.y < -40 || p.y > h + 40 || p.x < -40 || p.x > w + 40) spawn(p, p.home, false);
      }
    };

    const render = (reveal: number) => {
      seamReveal = reveal;
      drawBase();
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      const ox = -pointer.x * 8;
      const oy = -pointer.y * 6;
      ctx.drawImage(base, 2, 2, base.width - 4, base.height - 4, ox - 12, oy - 12, w + 24, h + 24);
      ctx.save();
      ctx.translate(ox * 0.5, oy * 0.5);
      drawSeam(reveal);
      ctx.restore();
      drawParticles();
    };

    resize();

    if (reduced) {
      const still = () => {
        seamFrac = seamTarget(w, focusRef.current);
        syncSeam();
        render(1);
      };
      redrawRef.current = still;
      still();
      const onResize = () => {
        resize();
        still();
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    let raf = 0;
    let last = performance.now();
    const start = last;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      step(dt);
      const k = Math.min(1, Math.max(0, (now - start - 250) / 1400));
      render(1 - (1 - k) ** 3);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / Math.max(w, 1)) * 2 - 1;
      pointer.ty = (e.clientY / Math.max(h, 1)) * 2 - 1;
    };
    window.addEventListener("resize", resize);
    if (finePointer) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fusion-canvas pointer-events-none fixed inset-0 h-full w-full" aria-hidden="true" />;
}
