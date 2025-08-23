import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  applyBlock,
  BlockType,
  isBlock,
} from "@/lib/notesToolbar/toolbar-actions";
import {Type, Heading1, Heading2, Heading3, List, ListOrdered, LucideIcon} from "lucide-react";
import React from "react";
import NotesToolbarTextFormatterItem from "@/components/Notes/NotesToolbar/notes-toolbar-text-formatter-item";

export default function NotesToolbarTextFormatter({
  editorRef,
  setContent,
}: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  setContent: (html: string) => void;
}) {
  const blocks: BlockType[] = ["h1", "h2", "h3", "p"];
	const blockIcons: Record<string, LucideIcon> = {
		p: Type,
		h1: Heading1,
		h2: Heading2,
		h3: Heading3,
		ul: List,
		ol: ListOrdered,
	};
  return (
    <DropdownMenu>
	    <DropdownMenuTrigger asChild>
		    <Button size="sm" variant="ghost" className="px-2 py-1 rounded">
			    {isBlock() || "Text"}
		    </Button>
	    </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 p-1">
        <h3 className="text-muted-foreground font-bold px-2 py-1 text-xs select-none cursor-default">
          Turn into
        </h3>
        <div className={"flex flex-col space-y-1"}>
	        {blocks.map((blockType) => (
						<NotesToolbarTextFormatterItem
							key={blockType}
							editorRef={editorRef}
							setContent={setContent}
							blockType={blockType}
							icon={blockIcons[blockType]}
						/>
	        ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
