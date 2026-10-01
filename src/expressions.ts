import * as expressions from "blobatar/expression";
import type { Expression } from "blobatar";

export const EXPRESSION_NAMES = [
  "idle", "happy", "sad", "mad", "surprised", "wink", "sleepy", "smug",
  "unsure", "scared", "love", "shy", "sick", "thinking",
] as const;
export type ExpressionName = (typeof EXPRESSION_NAMES)[number];

export const exprOf = (n: ExpressionName | "none"): Expression | undefined =>
  n === "none" ? undefined : (expressions as unknown as Record<string, Expression>)[n];
