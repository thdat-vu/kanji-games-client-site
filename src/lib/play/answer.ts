function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/^[\s.,;:!?()[\]"']+|[\s.,;:!?()[\]"']+$/g, "")
    .replace(/\s+/g, " ");
}

function stripParensChars(s: string): string {
  return s.replace(/[()[\]]/g, " ").replace(/\s+/g, " ").trim();
}

function dropParensContent(s: string): string {
  return s.replace(/[([][^)\]]*[)\]]/g, " ").replace(/\s+/g, " ").trim();
}

function partVariants(part: string): string[] {
  const trimmed = part.trim();
  if (!trimmed) return [];
  const variants = new Set<string>();
  variants.add(normalize(trimmed));
  variants.add(normalize(stripParensChars(trimmed)));
  variants.add(normalize(dropParensContent(trimmed)));
  variants.delete("");
  return [...variants];
}

function splitParts(s: string): string[] {
  return s
    .split(/[,;]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function isAnswerCorrect(userAnswer: string, meaning: string): boolean {
  const userParts = splitParts(userAnswer)
    .map(normalize)
    .map((p) => stripParensChars(p) || p)
    .filter((p) => p.length > 0);
  if (userParts.length === 0) return false;

  const meaningVariantSet = new Set<string>();
  for (const part of splitParts(meaning)) {
    for (const v of partVariants(part)) meaningVariantSet.add(v);
  }
  if (meaningVariantSet.size === 0) return false;

  return userParts.every((part) => meaningVariantSet.has(part));
}
