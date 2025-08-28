import React from "react";
//region Toolbar types and constants
interface ToolbarActionProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  setContent: (html: string) => void;
  colour?: ColorName;
  backgroundColour?: BackgroundName;
  blockType?: BlockType;
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

const backgrounds = {
  default: "--toolbar-bg-default",
  green: "--toolbar-bg-green",
  cyan: "--toolbar-bg-cyan",
  orange: "--toolbar-bg-orange",
  purple: "--toolbar-bg-purple",
  red: "--toolbar-bg-red",
  yellow: "--toolbar-bg-yellow",
  grey: "--toolbar-bg-grey",
  pink: "--toolbar-bg-pink",
  teal: "--toolbar-bg-teal",
};

export type ColorName = keyof typeof colors;
export type BackgroundName = keyof typeof backgrounds;
export type BlockType = "p" | "h1" | "h2" | "h3" | "ul" | "ol";

//endregion
//region Base Toolbar actions
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

  if (editorRef.current) {
    const currentColor = isColor();
    if (currentColor) {
      const range = selection.getRangeAt(0);
      const elements = range.cloneContents().querySelectorAll("u");

      elements.forEach((el) => {
        (el as HTMLElement).style.textDecorationColor = currentColor;
      });
    }

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

  if (editorRef.current) {
    const currentColor = isColor();
    if (currentColor) {
      const range = selection.getRangeAt(0);
      const elements = range.cloneContents().querySelectorAll("strike, s");

      elements.forEach((el) => {
        (el as HTMLElement).style.textDecorationColor = currentColor;
      });
    }

    setContent(editorRef.current.innerHTML);
  }
}

export function isStrikethrough() {
  return document.queryCommandState("strikethrough");
}
//endregion
//region Colour and Background actions
export function applyColour({
  editorRef,
  setContent,
  colour,
}: ToolbarActionProps) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !colour) return;

  // Look up the CSS variable name
  const cssVar = colors[colour];

  // Resolve it to an actual hex value from :root
  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .trim();

  if (!resolved) {
    console.warn(`No value found for ${cssVar}`);
    return;
  }

  // Apply inline foreground colour
  document.execCommand("foreColor", false, resolved);

  if (editorRef.current) {
    const range = selection.getRangeAt(0);
    const elements = Array.from(
      editorRef.current.querySelectorAll("u, s, strike"),
    ).filter((el) => range.intersectsNode(el));

    elements.forEach((el) => {
      (el as HTMLElement).style.textDecorationColor = resolved;
    });

    setContent(editorRef.current.innerHTML);
  }
}

export function applyBackground({
  editorRef,
  setContent,
  backgroundColour,
}: ToolbarActionProps) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !backgroundColour) return;

  // Look up the CSS variable name
  const cssVar = backgrounds[backgroundColour];

  // Resolve it to an actual hex value from :root
  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .trim();

  if (!resolved) {
    console.warn(`No value found for ${cssVar}`);
    return;
  }

  // Apply inline foreground colour
  document.execCommand("backColor", false, resolved);

  if (editorRef.current) {
    setContent(editorRef.current.innerHTML);
  }
}

function resolveVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
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
    if (color && color !== "rgb(0, 0, 0)" && color !== "rgba(0, 0, 0, 0)") {
      return color;
    }
    node = node.parentElement;
  }

  return null;
}

export function isBackground(): string | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  let node: Node | null = range.startContainer;

  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }
  while (node && node instanceof HTMLElement) {
    const bg = getComputedStyle(node).backgroundColor;
    if (
      bg &&
      bg !== "rgba(0, 0, 0, 0)" && // ignore transparent
      bg !== "transparent"
    ) {
      return bg;
    }
    node = node.parentElement;
  }

  return null;
}

export function getBackgroundMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  return {
    default: resolveVar("--toolbar-bg-default"),
    green: resolveVar("--toolbar-bg-green"),
    cyan: resolveVar("--toolbar-bg-cyan"),
    orange: resolveVar("--toolbar-bg-orange"),
    purple: resolveVar("--toolbar-bg-purple"),
    red: resolveVar("--toolbar-bg-red"),
    yellow: resolveVar("--toolbar-bg-yellow"),
    grey: resolveVar("--toolbar-bg-grey"),
    pink: resolveVar("--toolbar-bg-pink"),
    teal: resolveVar("--toolbar-bg-teal"),
  };
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

export function isBackgroundName(): BackgroundName | null {
  const current = isBackground();
  if (!current) return null;

  const bgMap = getBackgroundMap();

  for (const [name, hex] of Object.entries(bgMap)) {
    const temp = document.createElement("div");
    temp.style.backgroundColor = hex;
    document.body.appendChild(temp);
    const resolved = getComputedStyle(temp).backgroundColor;
    document.body.removeChild(temp);

    if (resolved === current) return name as BackgroundName;
  }
  return null;
}
//endregion

export function applyBlock({
  blockType,
  editorRef,
  setContent,
}: {
  blockType: BlockType | undefined;
  editorRef: React.RefObject<HTMLDivElement | null>;
  setContent: (html: string) => void;
}) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  document.execCommand("formatBlock", false, blockType);

  if (editorRef.current) {
    setContent(editorRef.current.innerHTML);
  }
}

export const blockNameMap: Record<string, string> = {
  p: "Text",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  ul: "List",
  ol: "ListOrdered",
};

export function isBlock(): string | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  let node: Node | null = selection.getRangeAt(0).startContainer;

  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }

  while (node && node instanceof HTMLElement) {
    const tag = node.tagName.toLowerCase();
    if (tag in blockNameMap) {
      return blockNameMap[tag];
    }
    node = node.parentElement;
  }
  return "Text";
}
