import {
  calculateScores,
  tokenizeText,
  stripText,
  removeStopWords,
} from "../notes/search-score";
import { FlashcardSet } from "../types";

addEventListener("message", (event) => {
  const { searchQuery, sets } = event.data;

  if (!searchQuery.trim()) {
    postMessage(sets);
    return;
  }

  const q = removeStopWords(tokenizeText(stripText(searchQuery)));

  const results = sets
    .map((set: FlashcardSet) => {
      const setTitle = removeStopWords(tokenizeText(stripText(set.title)));
      const setDescription = removeStopWords(
        tokenizeText(stripText(set.description || "")),
      );

      const titleScore = calculateScores(q, setTitle);
      const descScore = calculateScores(q, setDescription);

      let finalScore = 0;
      let matchSource: "title" | "description" | "none" = "none";

      if (titleScore > 0.1) {
        finalScore = titleScore * 2.5;
        matchSource = "title";
      } else if (descScore > 0.1) {
        finalScore = descScore;
        matchSource = "description";
      }

      return { ...set, score: finalScore, matchSource };
    })
    .filter((s: any) => s.matchSource !== "none")
    .sort((a: any, b: any) => b.score - a.score);

  postMessage(results);
});
