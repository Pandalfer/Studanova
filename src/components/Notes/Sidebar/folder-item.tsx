import { Folder, Note } from "@/types";
import React from "react";
import NoteItem from "@/components/Notes/Sidebar/note-item";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export default function FolderItem({
	                                   folder,
	                                   openFolders,
	                                   setOpenFolders,
	                                   onSelectNote,
	                                   onRenameNote,
	                                   onDeleteNote,
	                                   onDuplicateNote,
	                                   activeNoteId,
                                   }: {
	folder: Folder;
	openFolders: string[];
	setOpenFolders: React.Dispatch<React.SetStateAction<string[]>>;
	onSelectNote: (note: Note) => void;
	onRenameNote: (note: Note, newTitle: string) => void;
	onDeleteNote: (id: string) => void;
	onDuplicateNote: (note: Note) => void;
	activeNoteId?: string;
}) {
	const isClosestFolder = folder.notes?.some(n => n.id === activeNoteId) ?? false;

	function collectDescendantFolderIds(folder: Folder): string[] {
		let ids: string[] = [];
		if (folder.folders) {
			for (const child of folder.folders) {
				ids.push(child.id);
				ids = ids.concat(collectDescendantFolderIds(child));
			}
		}
		return ids;
	}

	return (
		<Accordion
			type="multiple"
			value={openFolders}
			onValueChange={(newValue) => {
				if (openFolders.includes(folder.id) && !newValue.includes(folder.id)) {
					// folder is being closed
					const descendantIds = collectDescendantFolderIds(folder);
					setOpenFolders(newValue.filter(id => !descendantIds.includes(id)));
				} else {
					setOpenFolders(newValue);
				}
			}}
		>
			<AccordionItem value={folder.id}>
				<AccordionTrigger
					className="h-12 w-[17rem] flex items-center text-left font-bold dark:hover:bg-accent truncate"
					arrow="left"
				>
					{folder.title.substring(0, 25)}
					{folder.title.length > 25 ? "..." : ""}
				</AccordionTrigger>

				<AccordionContent className="mt-2">
					<div className={`flex flex-col gap-2 pl-4 border-l ${isClosestFolder ? "border-muted" : "border-border"}`}>
						{/* Nested Folders */}
						{folder.folders?.map(subfolder => (
							<div key={subfolder.id} className="rounded-md transition-colors">
								<FolderItem
									folder={subfolder}
									openFolders={openFolders}
									setOpenFolders={setOpenFolders}
									onSelectNote={onSelectNote}
									onRenameNote={onRenameNote}
									onDeleteNote={onDeleteNote}
									onDuplicateNote={onDuplicateNote}
									activeNoteId={activeNoteId}
								/>
							</div>
						))}

						{/* Notes */}
						{folder.notes?.map(note => (
							<div key={note.id} className="rounded-md transition-colors">
								<NoteItem
									note={note}
									onSelectNote={onSelectNote}
									onRenameNote={onRenameNote}
									onDeleteNote={onDeleteNote}
									onDuplicateNote={onDuplicateNote}
									activeNoteId={activeNoteId}
								/>
							</div>
						))}
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
