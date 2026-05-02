/**
 * Shared helpers for cognitive & geometry quiz behaviour.
 */

const EXCLUSIVE_OPTION_PATTERNS = [
  /j['’]ai\s+oubli/i,        // "J'ai oublié"
  /j['’]ai\s+tout\s+oubli/i, // "J'ai tout oublié"
  /je\s+ne\s+sais\s+pas/i,   // "Je ne sais pas"
  /\bi\s+forgot\b/i,
  /\bi\s+don['’]?t\s+know\b/i,
  /^aucune\s+r[eé]ponse$/i,  // "Aucune réponse"
]

/**
 * Returns true when an option text represents a "forgot / don't know"
 * answer. These options must behave as mutually exclusive — selecting one
 * clears any other selection, and conversely selecting any other option
 * clears the exclusive one.
 */
export function isExclusiveOption(option: string): boolean {
  if (!option) return false
  // Strip LaTeX wrappers and HTML so the pattern matches plain text.
  const flat = option
    .replace(/\\\([\s\S]*?\\\)/g, '')
    .replace(/<[^>]+>/g, '')
    .trim()
  return EXCLUSIVE_OPTION_PATTERNS.some((re) => re.test(flat))
}

/**
 * Compute the next selection list when an option is toggled, applying the
 * "I forgot / I don't know" exclusion rule.
 *
 *  - If the toggled option is exclusive: replace selection with [idx] (or [])
 *  - Otherwise: drop any currently-selected exclusive option, then toggle
 *    `idx` in the remaining list.
 */
export function toggleSelectionWithExclusive(
  options: string[],
  prev: number[],
  idx: number,
  isMulti: boolean,
): number[] {
  const exclusive = isExclusiveOption(options[idx])

  // Single-choice question: clicking always replaces
  if (!isMulti) {
    return prev.length === 1 && prev[0] === idx ? [] : [idx]
  }

  // Multi-choice question
  if (exclusive) {
    // Toggle the exclusive option on/off; nothing else can stay selected.
    return prev.length === 1 && prev[0] === idx ? [] : [idx]
  }

  // Drop any currently-selected exclusive option, then toggle this one.
  const cleaned = prev.filter((i) => !isExclusiveOption(options[i]))
  if (cleaned.includes(idx)) return cleaned.filter((i) => i !== idx)
  return [...cleaned, idx]
}
