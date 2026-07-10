/**
 * @module lib/ai/sanitize
 *
 * Prompt-injection defense layer. User text passes through this sanitizer
 * before reaching the AI model, neutralising common attack patterns. The
 * approach is defense-in-depth: even if a pattern slips through, the system
 * prompt explicitly labels user messages as untrusted data.
 */

/** Placeholder text that replaces detected injection attempts. */
const INJECTION_REPLACEMENT = '[filtered]';

/** Regex pattern matching control characters (U+0000–U+001F, U+007F). */
const CONTROL_CHAR_PATTERN = /[\u0000-\u001f\u007f]/g;

/** Collapse runs of three or more whitespace characters to two. */
const EXCESSIVE_WHITESPACE_PATTERN = /\s{3,}/g;

/**
 * Known prompt-injection phrasings that attempt to override system instructions.
 * Each pattern is global + case-insensitive so all occurrences are neutralised.
 */
const INJECTION_PATTERNS: readonly RegExp[] = [
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
 *
 * @param input - Raw, untrusted text from the client.
 * @returns Sanitized text safe for inclusion in an AI prompt as data.
 */
export function sanitizeUserText(input: string): string {
  let output = input;

  for (const pattern of INJECTION_PATTERNS) {
    output = output.replace(pattern, INJECTION_REPLACEMENT);
  }

  // Collapse control characters and excessive whitespace.
  return output.replace(CONTROL_CHAR_PATTERN, ' ').replace(EXCESSIVE_WHITESPACE_PATTERN, '  ').trim();
}
