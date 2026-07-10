const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(?:all\s+|previous\s+|prior\s+|the\s+|above\s+)*(?:instructions|prompts?|rules)/gi,
  /disregard\s+(?:all\s+|previous\s+|prior\s+|the\s+|above\s+)*(?:instructions|rules|prompts?)/gi,
  /you are now\b/gi,
  /system prompt/gi,
  /reveal (your |the )?(system )?prompt/gi,
  /act as (an?|the)\b/gi,
  /developer mode/gi
];

/**
 * Neutralises common prompt-injection phrasing in untrusted user text before
 * it reaches the model. User input is always treated as data, never as
 * instructions — this keeps the trust boundary explicit.
 */
export function sanitizeUserText(input: string): string {
  let output = input;

  for (const pattern of INJECTION_PATTERNS) {
    output = output.replace(pattern, '[filtered]');
  }

  // Collapse control characters and excessive whitespace.
  return output
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s{3,}/g, '  ')
    .trim();
}
