import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { applyBlock, blockNameMap, BlockType } from "@/lib/notes/notes-toolbar/toolbar-actions";
import { LucideIcon, Check } from "lucide-react";

export default function NotesToolbarTextFormatterItem({
	                                                      editorRef,
	                                                      setContent,
	                                                      blockType,
	                                                      icon: Icon,
	                                                      active,
                                                      }: {
	editorRef: React.RefObject<HTMLDivElement | null>;
	setContent: (html: string) => void;
	blockType?: BlockType | undefined;
	icon?: LucideIcon;
	active?: boolean;
}) {
	return (
		<DropdownMenuItem asChild>
			<Button
				variant="ghost"
				className="w-full px-2 py-1"
				onClick={() => applyBlock({ blockType: blockType, editorRef, setContent })}
			>
				<div className="flex items-center justify-between w-full">
					{/* Left side: Icon + text */}
					<div className="flex items-center gap-2">
						{Icon && (
							<Icon
								size={20}
								className={`w-5 h-5 ${active ? "text-primary" : "text-toolbar-white"}`}
							/>
						)}
						<span className={active ? "text-primary" : ""}>
              {blockType && blockNameMap[blockType]}
            </span>
					</div>

					{/* Right side: tick if active */}
					{active && <Check size={18} className="text-primary" />}
				</div>
			</Button>
		</DropdownMenuItem>
	);
}
