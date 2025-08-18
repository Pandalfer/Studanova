import React from "react";

interface ToolbarActionProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  setContent: (html: string) => void;
  colour?: ColorName;
}

const colors = {
  white: "--toolbar-white",
  green: "--toolbar-green",
  cyan: "--toolbar-cyan",
  orange: "--toolbar-orange",
  purple: "--toolbar-purple",
  red: "--toolbar-red",
  yellow: "--toolbar-yellow",
  grey: "--toolbar-grey",
  pink: "--toolbar-pink",
  teal: "--toolbar-teal",
};

export type ColorName = keyof typeof colors;

export function applyBold({ editorRef, setContent }: ToolbarActionProps) {
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

export function applyItalic({ editorRef, setContent }: ToolbarActionProps) {
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

export function applyUnderline({ editorRef, setContent }: ToolbarActionProps) {
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

export function applyStrikethrough({
  editorRef,
  setContent,
}: ToolbarActionProps) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  document.execCommand("strikethrough");

  // Sync state with editor’s HTML
  if (editorRef.current) {
    setContent(editorRef.current.innerHTML);
  }
}

export function isStrikethrough() {
  return document.queryCommandState("strikethrough");
}

export function applyColour({ editorRef, setContent, colour }: ToolbarActionProps) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !colour) return;

  // Look up the CSS variable name
  const cssVar = colors[colour];

  // Resolve it to an actual hex value from :root
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();

  if (!resolved) {
    console.warn(`No value found for ${cssVar}`);
    return;
  }

  // Apply inline foreground colour
  document.execCommand("foreColor", false, resolved);

  if (editorRef.current) {
    setContent(editorRef.current.innerHTML);
  }
}

function resolveVar(name: string): string {
  if (typeof window === "undefined") return ""; // SSR safe
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function getColorMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  return {
    white: resolveVar("--toolbar-white"),
    green: resolveVar("--toolbar-green"),
    cyan: resolveVar("--toolbar-cyan"),
    orange: resolveVar("--toolbar-orange"),
    purple: resolveVar("--toolbar-purple"),
    red: resolveVar("--toolbar-red"),
    yellow: resolveVar("--toolbar-yellow"),
    grey: resolveVar("--toolbar-grey"),
    pink: resolveVar("--toolbar-pink"),
    teal: resolveVar("--toolbar-teal"),
  };
}

export function isColor(): string | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  let node: Node | null = range.startContainer;

  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }
  while (node && node instanceof HTMLElement) {
    const color = getComputedStyle(node).color;
    if (
      color &&
      color !== "rgb(0, 0, 0)" &&
      color !== "rgba(0, 0, 0, 0)"
    ) {
      return color;
    }
    node = node.parentElement;
  }

  return null;
}


export function isColorName(): ColorName | null {
  const current = isColor();
  if (!current) return null;

  const colorMap = getColorMap();

  for (const [name, hex] of Object.entries(colorMap)) {
    const temp = document.createElement("div");
    temp.style.color = hex;
    document.body.appendChild(temp);
    const resolved = getComputedStyle(temp).color;
    document.body.removeChild(temp);

    if (resolved === current) return name as ColorName;
  }
  return null;
}
