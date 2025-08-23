import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {applyBlock, blockNameMap, BlockType} from "@/lib/notesToolbar/toolbar-actions";
import {Heading1, LucideIcon} from "lucide-react";

export default function NotesToolbarTextFormatterItem({
  editorRef,
  setContent,
	blockType,
	icon: Icon,
}: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  setContent: (html: string) => void;
	blockType?: BlockType | undefined;
	icon?: LucideIcon;
}) {
  return (
    <DropdownMenuItem asChild>
      <Button
        variant="ghost"
        className="w-full px-2 py-1"
        onClick={() => applyBlock({ blockType: blockType, editorRef, setContent })}
      >
        <div className="flex items-center gap-2 justify-start w-full">
	        {Icon && <Icon size={20} className={"w-5 h-5 text-toolbar-white"} />}
          <span>{blockType && (
						blockNameMap[blockType] )}</span>
        </div>
      </Button>
    </DropdownMenuItem>
  );
}
