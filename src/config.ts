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
  const head = brand?.colors[0];
  if (brand && head) {
    style.palette = { ...(brand.backdrop ? { bg: brand.backdrop } : {}), head, eye: brand.eye ?? eyeFor(head) };
  }
  if (expr !== "none") style.expression = "__EXPR__";
  const styleBody = toTs(style).replace("'__EXPR__'", expr);

  const lines = ["import type { BlobatarOptions } from 'blobatar';"];
  if (expr !== "none") lines.push(`import { ${expr} } from 'blobatar/expression';`);
  lines.push(
    "",
    "/** Shape, eyes and colours shared by every avatar. */",
    `export const AVATAR_STYLE: BlobatarOptions = ${styleBody};`,
    "",
    "/** Options for one user. The seed should be stable, e.g. the user ID or email. */",
    "export function avatarOptions(seed: string): BlobatarOptions {",
    "  return AVATAR_STYLE;",
    "}",
    "",
  );
  return lines.join("\n");
}
