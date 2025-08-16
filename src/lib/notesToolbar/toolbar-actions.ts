import React from "react";

export function applyBold(
  editorRef: React.RefObject<HTMLDivElement | null>,
  setContent: (html: string) => void,
) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  document.execCommand("bold");

  // Sync state with editor’s HTML
  if (editorRef.current) {
    setContent(editorRef.current.innerHTML);
  }
}

export function isBold() {
  return document.queryCommandState("bold");
}

export function applyItalic(
  editorRef: React.RefObject<HTMLDivElement | null>,
  setContent: (html: string) => void,
) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  document.execCommand("italic");

  // Sync state with editor’s HTML
  if (editorRef.current) {
    setContent(editorRef.current.innerHTML);
  }
}

export function isItalic() {
  return document.queryCommandState("italic");
}

export function applyUnderline(
  editorRef: React.RefObject<HTMLDivElement | null>,
  setContent: (html: string) => void,
) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  document.execCommand("underline");

  // Sync state with editor’s HTML
  if (editorRef.current) {
    setContent(editorRef.current.innerHTML);
  }
}

export function isUnderline() {
  return document.queryCommandState("underline");
}