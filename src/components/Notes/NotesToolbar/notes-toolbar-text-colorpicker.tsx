import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import React from "react";
import { ColorName } from "@/lib/notesToolbar/toolbar-actions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function NotesToolbarTextColorpicker({
                                                      color,
                                                      onClick,
                                                      className,
                                                      active,
                                                    }: {
  color: ColorName;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenuItem
          onClick={onClick}
          className={`
        cursor-pointer
        col-span-1
        row-span-1
        transition-all
        duration-300
        border
        aspect-square
        justify-center
        items-center
        flex
        text-[var(--toolbar-color)]
        border-[var(--toolbar-color)]/50
        dark:hover:bg-popover
        ring-offset-0
        ${active
            ? "ring-2 ring-[var(--toolbar-color)]"
            : "hover:ring-2 hover:ring-[var(--toolbar-color)]/50"}
      ` + (" " + className || "")}
          style={
            { "--toolbar-color": `var(--toolbar-${color})` } as React.CSSProperties
          }
        >
          A
        </DropdownMenuItem>
      </TooltipTrigger>
      <TooltipContent  >
        <p>{String(color).charAt(0).toUpperCase() + String(color).slice(1) + " text"}</p>
      </TooltipContent>
    </Tooltip>

  );
}
