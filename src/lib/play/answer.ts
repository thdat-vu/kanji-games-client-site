function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/^[\s.,;:!?()[\]"']+|[\s.,;:!?()[\]"']+$/g, "")
    .replace(/\s+/g, " ");
}

function splitParts(s: string): string[] {
  return s
    .split(/[,;]/)
    .map(normalize)
    .filter((p) => p.length > 0);
}

export function isAnswerCorrect(userAnswer: string, meaning: string): boolean {
  const userParts = splitParts(userAnswer);
  if (userParts.length === 0) return false;

  const meaningParts = splitParts(meaning);
  if (meaningParts.length === 0) return false;

  const meaningSet = new Set(meaningParts);
  return userParts.every((part) => meaningSet.has(part));
}
