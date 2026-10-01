import type { BlobatarOptions } from "blobatar";
import { BRAND_COLORS, WHITE, brandOptions, type BrandSettings } from "./brand";
import { exprOf, type ExpressionName } from "./expressions";

// Eye trait keys from blobatar's src/styles/compose.ts. Each is a 0–1 position.
export const EYE_TRAITS = [
  { key: "eye.rx", label: "Width", low: "thin", high: "wide" },
  { key: "eye.ratio", label: "Height", low: "squat", high: "tall" },
  { key: "eye.n", label: "Corners", low: "round", high: "square" },
  { key: "eye.gap", label: "Spacing", low: "close", high: "apart" },
  { key: "eye.scale", label: "Right eye size", low: "smaller", high: "bigger" },
  { key: "eye.stretch", label: "Right eye height", low: "shorter", high: "taller" },
  { key: "eye.lean", label: "Tilt", low: "left", high: "right" },
  { key: "eye.lean2", label: "Right eye extra tilt", low: "left", high: "right" },
  { key: "eye.dy", label: "Right eye height offset", low: "up", high: "down" },
  { key: "gaze.x", label: "Position on face", low: "left", high: "right" },
  { key: "gaze.y", label: "Height on face", low: "high", high: "low" },
] as const;
export type TraitKey = (typeof EYE_TRAITS)[number]["key"];
export type TraitState = Record<TraitKey, { on: boolean; v: number }>;

export type Shape = "default" | "none" | "square" | "circle" | "squircle";
export type ColorMode = "brand" | "free";

export type Settings = {
  expr: ExpressionName | "none";
  shape: Shape;
  colorMode: ColorMode;
  brandColor: string;
  backdrop: string | null;
  lockHue: boolean;
  hue: number;
  lockTone: boolean;
  tone: number;
  traits: TraitState;
  lockEyeColor: boolean;
  eyeColor: string;
};

export const initialTraits = () =>
  Object.fromEntries(EYE_TRAITS.map((t) => [t.key, { on: false, v: 0.5 }])) as TraitState;

export const initialSettings = (): Settings => ({
  expr: "none",
  shape: "circle",
  colorMode: "brand",
  brandColor: BRAND_COLORS[0].hex, // Orange
  backdrop: WHITE,
  lockHue: false,
  hue: 200,
  lockTone: false,
  tone: 0.5,
  traits: initialTraits(),
  lockEyeColor: false,
  eyeColor: "#171717",
});

const round = (n: number) => Math.round(n * 1000) / 1000;
const hasBackdrop = (s: Settings) => s.shape !== "default" && s.shape !== "none";

/** Options shared by every name: shape, eyes, and colour locks in free mode. */
export function baseOptions(s: Settings): BlobatarOptions {
  const o: BlobatarOptions = {};
  if (s.shape === "none") o.background = false;
  else if (s.shape !== "default") o.background = s.shape;
  if (s.colorMode === "free") {
    if (s.lockHue) o.hue = s.hue;
    if (s.lockTone) o.tone = round(s.tone);
    if (s.lockEyeColor) o.palette = { eye: s.eyeColor };
  }
  const pinned = EYE_TRAITS.filter((t) => s.traits[t.key].on);
  if (pinned.length) o.traits = Object.fromEntries(pinned.map((t) => [t.key, round(s.traits[t.key].v)]));
  return o;
}

export function brandSettings(s: Settings): BrandSettings | null {
  if (s.colorMode !== "brand") return null;
  return {
    colors: [s.brandColor],
    backdrop: hasBackdrop(s) ? s.backdrop : null,
    eye: s.lockEyeColor ? s.eyeColor : null,
  };
}

/** Everything for one name, including the selected expression. */
export function optionsFor(seed: string, s: Settings, withExpr = true): BlobatarOptions {
  const base = baseOptions(s);
  const brand = brandSettings(s);
  const o = brand ? brandOptions(seed, base, brand) : base;
  return withExpr && s.expr !== "none" ? { ...o, expression: exprOf(s.expr) } : o;
}
