import React, { useEffect, useState } from "react";

export function useSelectionRect(
  editorRef: React.RefObject<HTMLDivElement | null>,
) {
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      requestAnimationFrame(() => {
        const selection = window.getSelection();
        if (!selection || selection.toString().trim() === "") {
          setSelectionRect(null);
          return;
        }

        const rect = selection.getRangeAt(0).getBoundingClientRect();
        console.log(rect);
        setSelectionRect(rect);
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.ctrlKey &&
        e.key === "a" &&
        editorRef.current &&
        editorRef.current.contains(document.activeElement)
      ) {
        e.preventDefault();

        const selection = window.getSelection();
        if (!selection) return;

        const range = document.createRange();
        range.selectNodeContents(editorRef.current);

        selection.removeAllRanges();
        selection.addRange(range);

        const rect = selection.getRangeAt(0).getBoundingClientRect();
        setSelectionRect(rect);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editorRef]);

  return selectionRect;
}
