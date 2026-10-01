import type { BlobatarOptions } from "blobatar";

export const ONYX = "#171717";
export const WHITE = "#F5F5F5";

export const BRAND_COLORS = [
  { name: "Orange", hex: "#FF3C00" },
  { name: "Purple", hex: "#A600FF" },
  { name: "Yellow", hex: "#FFC701" },
  { name: "Green", hex: "#00FF04" },
  { name: "Blue", hex: "#0066FF" },
] as const;

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** Onyx or White, whichever reads better on the body colour. */
export const eyeFor = (head: string) => (contrast(head, ONYX) >= contrast(head, WHITE) ? ONYX : WHITE);

/**
 * Picks a colour per name. Kept textually identical to the copy emitted in the
 * config export, so the playground and the Angular app agree on every face.
 */
export function pickIndex(seed: string, n: number) {
  const s = seed.normalize("NFC").trim().toLowerCase();
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return (h >>> 0) % n;
}

export type BrandSettings = {
  colors: string[];          // enabled body colours, in order
  backdrop: string | null;   // backdrop fill, or null for the library default
  eye: string | null;        // fixed eye colour, or null for auto (Onyx/White)
};

export const brandOptions = (seed: string, base: BlobatarOptions, b: BrandSettings): BlobatarOptions => {
  if (!b.colors.length) return base;
  const head = b.colors[pickIndex(seed, b.colors.length)];
  return {
    ...base,
    palette: { ...(b.backdrop ? { bg: b.backdrop } : {}), head, eye: b.eye ?? eyeFor(head) },
  };
};
