import type { BlobatarOptions } from "blobatar";
import { eyeFor, type BrandSettings } from "./brand";
import type { ExpressionName } from "./expressions";

const toTs = (v: unknown, indent = ""): string =>
  JSON.stringify(v, null, 2)
    .replace(/"([a-z]+)":/g, "$1:") // unquote plain keys, keep 'eye.rx' quoted
    .replace(/"/g, "'")
    .replace(/\n/g, `\n${indent}`);

/** Builds the `avatar.config.ts` file for the Angular app. */
export function configCode(
  base: BlobatarOptions,
  expr: ExpressionName | "none",
  brand: BrandSettings | null,
): string {
  const style: Record<string, unknown> = { ...base };
  if (expr !== "none") style.expression = "__EXPR__";
  const styleBody = toTs(style).replace("'__EXPR__'", expr);

  const lines = ["import type { BlobatarOptions } from 'blobatar';"];
  if (expr !== "none") lines.push(`import { ${expr} } from 'blobatar/expression';`);
  lines.push("", "/** Shape, eyes and backdrop shared by every avatar. */");
  lines.push(`export const AVATAR_STYLE: BlobatarOptions = ${styleBody};`, "");

  if (!brand || !brand.colors.length) {
    lines.push(
      "/** Options for one user. The seed should be stable, e.g. the user ID or email. */",
      "export function avatarOptions(seed: string): BlobatarOptions {",
      "  return AVATAR_STYLE;",
      "}",
      "",
    );
    return lines.join("\n");
  }

  const colors = brand.colors.map((head) => ({ head, eye: brand.eye ?? eyeFor(head) }));
  lines.push(
    "/** Brand body colours, each with the eye colour that reads best on it. */",
    "const AVATAR_COLORS = [",
    ...colors.map((c) => `  { head: '${c.head}', eye: '${c.eye}' },`),
    "];",
    "",
    "/** Options for one user. The seed should be stable, e.g. the user ID or email. */",
    "export function avatarOptions(seed: string): BlobatarOptions {",
    "  const s = seed.normalize('NFC').trim().toLowerCase();",
    "  let h = 0x811c9dc5;",
    "  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);",
    "  const color = AVATAR_COLORS[(h >>> 0) % AVATAR_COLORS.length];",
    brand.backdrop
      ? `  return { ...AVATAR_STYLE, palette: { bg: '${brand.backdrop}', ...color } };`
      : "  return { ...AVATAR_STYLE, palette: color };",
    "}",
    "",
  );
  return lines.join("\n");
}
