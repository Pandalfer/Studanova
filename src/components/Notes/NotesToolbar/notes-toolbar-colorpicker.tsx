import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import NotesToolbarTextColorpicker from "@/components/Notes/NotesToolbar/notes-toolbar-text-colorpicker";
import {
  applyBackground,
  applyColour,
  BackgroundName,
  ColorName,
  isColorName,
  isBackgroundName,
} from "@/lib/notesToolbar/toolbar-actions";
import NotesToolbarBackgroundColourpicker from "@/components/Notes/NotesToolbar/notes-toolbar-background-colourpicker";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

export default function NotesToolbarColorPicker({
  editorRef,
  setContent,
}: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  setContent: (html: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [activeColor, setActiveColor] = useState<ColorName | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<BackgroundName | null>(
    null,
  );

  useEffect(() => {
    const handler = () => {
      setActiveColor(isColorName());
      setBackgroundColor(isBackgroundName()); // <-- add this
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  const colors: ColorName[] = [
    "white",
    "green",
    "cyan",
    "orange",
    "purple",
    "red",
    "yellow",
    "grey",
    "pink",
    "teal",
  ];

  const backgroundColors: BackgroundName[] = [
    "default",
    "green",
    "cyan",
    "orange",
    "purple",
    "red",
    "yellow",
    "grey",
    "pink",
    "teal",
  ];

  return (
    <Tooltip>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              A
              <ChevronDown
                size={16}
                className={`ml-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>

        <TooltipContent>
          <p>Text Colour</p>
        </TooltipContent>

        <DropdownMenuContent>
          <h3 className="text-muted-foreground font-bold p-2 text-xs cursor-default">
            Text colour
          </h3>
          <div className="grid grid-cols-5 grid-rows-2 gap-2 p-2">
            {colors.map((c) => (
              <NotesToolbarTextColorpicker
                key={c}
                color={c}
                active={activeColor === c}
                onClick={() => {
                  applyColour({ editorRef, setContent, colour: c });
                  setActiveColor(c);
                }}
              />
            ))}
          </div>
          <h3 className="text-muted-foreground font-bold p-2 text-xs cursor-default">
            Background colour
          </h3>
          <div className="grid grid-cols-5 grid-rows-2 gap-2 p-2">
            {backgroundColors.map((c) => (
              <NotesToolbarBackgroundColourpicker
                key={c}
                color={c}
                active={backgroundColor === c}
                onClick={() => {
                  applyBackground({ editorRef, setContent, backgroundColour: c });
                  setBackgroundColor(c);
                }}
              />
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </Tooltip>
  );
}
