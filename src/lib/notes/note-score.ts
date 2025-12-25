export function calculateLevenshteinDistance(
  word1: string,
  word2: string,
): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= word1.length; i++) {
    matrix[i] = [];
    for (let j = 0; j <= word2.length; j++) {
      matrix[i][j] = 0;
    }
  }

  for (let i = 0; i <= word1.length; i++) {
    matrix[i][0] = i;
  }
  for (let i = 0; i <= word2.length; i++) {
    matrix[0][i] = i;
  }
  for (let i = 1; i <= word1.length; i++) {
    for (let j = 1; j <= word2.length; j++) {
      const min_actions = Math.min(
        matrix[i - 1][j - 1],
        matrix[i][j - 1],
        matrix[i - 1][j],
      );
      if (word1[i - 1] == word2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = min_actions + 1;
      }
    }
  }
  return matrix[word1.length][word2.length];
}

const punctuation = /[.,?!]/g;
const HTMLTag = /<[^>]*>/g;

export function stripText(text: string): string {
  return text
    .replace(HTMLTag, " ")
    .toLowerCase()
    .replace(punctuation, "")
    .trim();
}

export function tokenizeText(text: string): string[] {
  return text.split(/\s+/).filter(t => t.length > 0);
}

export function removeStopWords(tokens: string[]): string[] {
  if (tokens.length <= 1) return tokens;
  const stopWords = new Set([
    "a",
    "also",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "because",
    "been",
    "but",
    "by",
    "for",
    "from",
    "has",
    "have",
    "however",
    "if",
    "in",
    "is",
    "not",
    "of",
    "on",
    "or",
    "so",
    "than",
    "that",
    "the",
    "their",
    "there",
    "these",
    "this",
    "to",
    "was",
    "were",
    "whatever",
    "whether",
    "which",
    "with",
    "would"
  ]);
  return tokens.filter(token => !stopWords.has(token));
}

const getDynamicThreshold = (queryLength: number): number => {
  if (queryLength <= 2) return 0; // Must be exact for very short strings
  if (queryLength <= 5) return 1; // Allow 1 typo
  if (queryLength <= 8) return 2; // Allow 2 typos
  return 3; // Max 3 typos for long strings
};

export function calculateScores(queryTokens: string[], textTokens: string[]): number {
  if (queryTokens.length === 0) return 0;

  let totalMatchScore = 0;

  for (const qToken of queryTokens) {
    let bestTokenScore = 0;

    for (const tToken of textTokens) {
      // 1. Exact Match
      if (qToken === tToken) {
        bestTokenScore = 1;
        break;
      }

      // If the word starts with the query, give it a high score (0.9)
      if (tToken.startsWith(qToken)) {
        const prefixScore = 0.9;
        bestTokenScore = Math.max(bestTokenScore, prefixScore);
        // Don't break yet, an exact match might be later in the list
      }

      // 3. Fuzzy Match (Typos)
      const threshold = getDynamicThreshold(qToken.length);
      const distance = calculateLevenshteinDistance(qToken, tToken);

      if (distance <= threshold) {
        const fuzzyScore = 1 - (distance / Math.max(qToken.length, tToken.length));
        bestTokenScore = Math.max(bestTokenScore, fuzzyScore);
      }
    }
    totalMatchScore += bestTokenScore;
  }

  return totalMatchScore / queryTokens.length;
}