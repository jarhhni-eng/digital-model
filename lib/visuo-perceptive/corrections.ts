export type VPSubtestId =
  | 'discrimination'
  | 'memoire_sequentielle'
  | 'memoire_perceptive'
  | 'cloture'
  | 'constance_forme'
  | 'figure_fond'
  | 'intrus'
  | 'fond_cache'

/**
 * For memory-odd/even subtests (memoire_sequentielle, memoire_perceptive):
 *   odd keys are stimulus placeholders (value is ignored), even keys hold the
 *   correct answer for the trial (pair = (odd, even)).
 */
export const CORRECTIONS: Record<VPSubtestId, Record<number, number>> = {
  discrimination: {
    1: 3, 2: 5, 3: 3, 4: 2, 5: 3, 6: 2, 7: 1, 8: 1, 9: 5, 10: 2,
    11: 4, 12: 4, 13: 5, 14: 4, 15: 2, 16: 5, 17: 3, 18: 1,
  },
  memoire_sequentielle: {
    1: 2, 2: 3, 3: 1, 4: 4, 5: 1, 6: 4, 7: 3, 8: 1, 9: 4, 10: 2,
    11: 2, 12: 3, 13: 1, 14: 3, 15: 2, 16: 3, 17: 2, 18: 4,
  },
  memoire_perceptive: {
    // Trial answers are at even positions: corr[2] = Q1, corr[4] = Q2, ..., corr[36] = Q18.
    // Odd positions are placeholders so buildTrials can pair (odd, even).
    1: 0, 2: 3,
    3: 0, 4: 2,
    5: 0, 6: 3,
    7: 0, 8: 4,
    9: 0, 10: 1,
    11: 0, 12: 4,
    13: 0, 14: 3,
    15: 0, 16: 2,
    17: 0, 18: 4,
    19: 0, 20: 1,
    21: 0, 22: 2,
    23: 0, 24: 1,
    25: 0, 26: 3,
    27: 0, 28: 4,
    29: 0, 30: 2,
    31: 0, 32: 4,
    33: 0, 34: 3,
    35: 0, 36: 1,
  },
  cloture: {
    1: 4, 2: 2, 3: 2, 4: 3, 5: 1, 6: 4, 7: 2, 8: 2, 9: 3, 10: 4,
    11: 1, 12: 4, 13: 3, 14: 2,
  },
  constance_forme: {
    1: 3, 2: 5, 3: 2, 4: 1, 5: 4, 6: 4, 7: 5, 8: 3, 9: 5,
  },
  figure_fond: {
    1: 4, 2: 1, 3: 5, 4: 3, 5: 2, 6: 3, 7: 1, 8: 2, 9: 2,
  },
  intrus: {
    1: 2, 2: 4, 3: 1, 4: 2, 5: 5, 6: 3, 7: 3, 8: 5, 9: 1, 10: 2,
    11: 2, 12: 1, 13: 4, 14: 3, 15: 4, 16: 5, 17: 2, 18: 4,
  },
  fond_cache: {
    1: 1, 2: 3, 3: 2, 4: 4, 5: 1, 6: 4, 7: 1, 8: 4, 9: 3, 10: 2,
    11: 3, 12: 1, 13: 2, 14: 4, 15: 3, 16: 1, 17: 2,
  },
}
