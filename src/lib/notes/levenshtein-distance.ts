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
