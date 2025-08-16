"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "usehooks-ts";
import { useSelectionRect } from "@/lib/notesToolbar/use-selection-rect";
import { useToolbarPosition } from "@/lib/notesToolbar/use-toolbar-position";
import {
  applyBold,
  applyItalic,
  applyUnderline,
  isBold,
  isItalic,
  isUnderline
} from "@/lib/notesToolbar/toolbar-actions";
import {Italic, Underline} from "lucide-react";


interface NotesToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  setContent: (html: string) => void;
}

export default function NotesToolbar({
  editorRef,
  setContent,
}: NotesToolbarProps) {
  const [visible, setVisible] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)", {
    initializeWithValue: false,
  });
  const toolbarRef = useRef<HTMLDivElement>(null);

  const selectionRect = useSelectionRect(editorRef);

  React.useEffect(() => {
    setVisible(!!selectionRect);
  }, [selectionRect]);

  const pos = useToolbarPosition(selectionRect, toolbarRef, isDesktop);

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-popover text-popover-foreground shadow-lg rounded-md px-3 py-2 flex space-x-2"
      style={{ top: pos.top, left: pos.left, transform: "translateY(-4px)" }}
      id="notes-toolbar"
    >
      {isBold() ? (
        <Button
          size="sm"
          variant="ghost"
          className="text-primary"
          onClick={() => applyBold(editorRef, setContent)}
        >
          B
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyBold(editorRef, setContent)}
        >
          B
        </Button>
      )}
      {isItalic() ? (
        <Button
          size="sm"
          variant="ghost"
          className="text-primary"
          onClick={() => applyItalic(editorRef, setContent)}
        >
          <Italic />
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyItalic(editorRef, setContent)}
        >
          <Italic />
        </Button>
      )}
      {isUnderline() ? (
        <Button
          size="sm"
          variant="ghost"
          className="text-primary"
          onClick={() => applyUnderline(editorRef, setContent)}
        >
          <Underline />
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyUnderline(editorRef, setContent)}
        >
          <Underline />
        </Button>
      )}

    </div>
  );
}
