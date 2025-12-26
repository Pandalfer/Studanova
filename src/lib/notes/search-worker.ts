// lib/notes/search.worker.ts
import {
  calculateScores,
  tokenizeText,
  stripText,
  removeStopWords,
} from "./note-score"; // Adjust paths as needed
import { collectAllNotes } from "./note-and-folder-actions";

addEventListener("message", (event) => {
  const { searchQuery, folders, notes } = event.data;

  if (!searchQuery.trim()) {
    postMessage([]);
    return;
  }

  const q = removeStopWords(tokenizeText(stripText(searchQuery)));
  const allNotes = [...collectAllNotes(folders), ...notes];

  const results = allNotes
    .map((note) => {
      const noteTitle = removeStopWords(tokenizeText(stripText(note.title)));
      const noteContent = removeStopWords(
        tokenizeText(stripText(note.content)),
      );

      const titleScore = calculateScores(q, noteTitle);
      const contentScore = calculateScores(q, noteContent);

      let finalScore = 0;
      let matchSource: "title" | "content" | "none" = "none";

      if (titleScore > 0.1) {
        finalScore = titleScore * 2;
        matchSource = "title";
      } else if (contentScore > 0.1) {
        finalScore = contentScore;
        matchSource = "content";
      }

      return { ...note, score: finalScore, matchSource };
    })
    .filter((n) => n.matchSource !== "none")
    .sort((a, b) => b.score - a.score);

  postMessage(results);
});
