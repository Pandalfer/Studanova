import React, { useEffect, useState } from "react";

export function useSelectionRect(
  editorRef: React.RefObject<HTMLDivElement | null>,
) {
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === "") {
        setSelectionRect(null);
        return;
      }

      if (
        editorRef.current &&
        selection.anchorNode &&
        !editorRef.current.contains(selection.anchorNode)
      ) {
        setSelectionRect(null);
        return;
      }

      const rect = selection.getRangeAt(0).getBoundingClientRect();
      setSelectionRect(rect);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("touchend", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("touchend", handleSelectionChange);
    };
  }, [editorRef]);

  return selectionRect;
}
