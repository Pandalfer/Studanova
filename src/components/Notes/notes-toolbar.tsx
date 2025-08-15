"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "usehooks-ts";
import React from "react";

interface NotesToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  setContent: (html: string) => void;
}

export default function NotesToolbar({
  editorRef,
  setContent,
}: NotesToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const isDesktop = useMediaQuery("(min-width: 640px)", {
    initializeWithValue: false,
  });
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Track selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === "") {
        setVisible(false);
        setSelectionRect(null);
        return;
      }

      if (
        editorRef.current &&
        selection.anchorNode &&
        !editorRef.current.contains(selection.anchorNode)
      ) {
        setVisible(false);
        setSelectionRect(null);
        return;
      }

      const rect = selection.getRangeAt(0).getBoundingClientRect();
      setSelectionRect(rect);
      setVisible(true);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("touchend", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("touchend", handleSelectionChange);
    };
  }, [editorRef]);

  // Position toolbar
  useLayoutEffect(() => {
    if (!selectionRect || !toolbarRef.current || !editorRef.current) return;

    const editorRect = editorRef.current.getBoundingClientRect();
    const toolbarWidth = toolbarRef.current.offsetWidth;
    const toolbarHeight = toolbarRef.current.offsetHeight;

    let top: number;
    let left: number;

    if (!isDesktop) {
      // Mobile: below selection
      left =
        selectionRect.left -
        editorRect.left +
        selectionRect.width / 2 -
        toolbarWidth / 2;
      top = selectionRect.bottom - editorRect.top + 8;
      left = Math.max(0, Math.min(left, editorRect.width - toolbarWidth));
    } else {
      // Desktop: center above selection
      top = selectionRect.top - editorRect.top - toolbarHeight + 80; // 8px margin above selection
      left =
        selectionRect.left -
        editorRect.left +
        selectionRect.width / 2 -
        toolbarWidth / 2;
    }

    setPos({ top, left });
  }, [selectionRect, isDesktop, editorRef]);

  if (!visible) return null;

  const boldText = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement("strong");
    span.appendChild(range.extractContents());
    range.insertNode(span);

    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 bg-popover text-popover-foreground shadow-lg rounded-md px-3 py-2 flex space-x-2"
      style={{ top: pos.top, left: pos.left }}
      id="notes-toolbar"
    >
      <Button size="sm" variant="ghost" onClick={boldText}>
        B
      </Button>
      <Button size="sm" variant="secondary">
        Copy
      </Button>
    </div>
  );
}
