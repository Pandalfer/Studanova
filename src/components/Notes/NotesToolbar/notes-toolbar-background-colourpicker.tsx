import { BackgroundName } from "@/lib/notesToolbar/toolbar-actions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import React from "react";

export default function NotesToolbarBackgroundColourpicker({
  color,
  onClick,
  className,
  active,
}: {
  color: BackgroundName;
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
            border-[var(--toolbar-bg-color)]/50
            ring-offset-0
            bg-[var(--toolbar-bg-color)]
            ${
              active
                ? "ring-2 ring-[var(--toolbar-color)]"
                : "hover:ring-2 hover:ring-[var(--toolbar-color)]/50"
            }
            ${className || ""}
          `}
          style={
            {
              "--toolbar-bg-color": `var(--toolbar-bg-${color})`,
              "--toolbar-color": `var(--toolbar-${color})`,
            } as React.CSSProperties
          }
        />
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {String(color).charAt(0).toUpperCase() +
            String(color).slice(1) +
            " background"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
