// NotesToolbar.tsx
"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSelectionRect } from "@/lib/notes/notes-toolbar/use-selection-rect";
import { useToolbarPosition } from "@/lib/notes/notes-toolbar/use-toolbar-position";
import {
  applyBold,
  applyItalic,
  applyStrikethrough,
  applyUnderline,
  isBold,
  isItalic,
  isStrikethrough,
  isUnderline,
} from "@/lib/notes/notes-toolbar/toolbar-actions";
import { Italic, Strikethrough, Underline } from "lucide-react";
import NotesToolbarColorPicker from "@/components/Notes/NotesToolbar/notes-toolbar-colorpicker";
import NotesToolbarTextFormatter from "@/components/Notes/NotesToolbar/notes-toolbar-text-formatter";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsDesktop } from "@/lib/utils";

interface NotesToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  setContent: (html: string) => void;
  editorSelected: boolean;
}

export default function NotesToolbar({
  editorRef,
  setContent,
  editorSelected,
}: NotesToolbarProps) {
  const [visible, setVisible] = useState(false);
  const isDesktop = useIsDesktop();
  const toolbarRef = useRef<HTMLDivElement>(null);

  const selectionRect = useSelectionRect(editorRef);

  React.useEffect(() => {
    setVisible(editorSelected && !!selectionRect);
  }, [editorSelected, selectionRect]);

  const pos = useToolbarPosition(selectionRect, toolbarRef, isDesktop);

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-popover text-popover-foreground border-1 border-border shadow-lg rounded-md px-3 py-2 flex space-x-2"
      style={{ top: pos.top, left: pos.left, transform: "translateY(-4px)" }}
      id="notes-toolbar"
    >
      <NotesToolbarTextFormatter
        editorRef={editorRef}
        setContent={setContent}
      />

      {/* Bold */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={isBold() ? "text-primary" : undefined}
            onClick={() => applyBold({ editorRef, setContent })}
          >
            B
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Bold</p>
          <p className="text-muted">Ctrl + B</p>
        </TooltipContent>
      </Tooltip>

      {/* Italic */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={isItalic() ? "text-primary" : undefined}
            onClick={() => applyItalic({ editorRef, setContent })}
          >
            <Italic />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Italic</p>
          <p className="text-muted">Ctrl + I</p>
        </TooltipContent>
      </Tooltip>

      {/* Underline */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={isUnderline() ? "text-primary" : undefined}
            onClick={() => applyUnderline({ editorRef, setContent })}
          >
            <Underline />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Underline</p>
          <p className="text-muted">Ctrl + U</p>
        </TooltipContent>
      </Tooltip>

      {/* Strikethrough */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={isStrikethrough() ? "text-primary" : undefined}
            onClick={() => applyStrikethrough({ editorRef, setContent })}
          >
            <Strikethrough />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Strikethrough</p>
        </TooltipContent>
      </Tooltip>

      <NotesToolbarColorPicker editorRef={editorRef} setContent={setContent} />
    </div>
  );
}
