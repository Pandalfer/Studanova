import clsx from "clsx";
import NotesEmptyState from "@/components/Notes/empty-state";
import {formatDate} from "@/lib/note-storage";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {SquarePen, Trash2} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Note} from "@/types";
import NoteItem from "@/components/Notes/Sidebar/note-item";

interface NotesSidebarProps {
	notes: Note[];
	onSelectNote: (note: Note) => void;
	createNewNote?: () => void;
	onDeleteNote: (id: string) => void;
	activeNoteId?: string;
}

export function NotesSidebar2({
	                              notes,
	                              onSelectNote,
	                              createNewNote,
	                              onDeleteNote,
	                              activeNoteId,
                              }: NotesSidebarProps) {

	return (
		<aside
			className={clsx(
				"h-screen fixed right-0 top-0 z-40 border-l bg-card transition-all duration-300 ease-in-out w-80",
			)}
		>
			<div className={"justify-center flex p-5"}>
				<Button onClick={createNewNote} className={"aspect-square"} variant={"ghost"}>
					<SquarePen />
				</Button>
			</div>

			{notes.length === 0 ? (
				<NotesEmptyState
					message={"No notes yet"}
					buttonText={"Create your first note"}
					onButtonClick={createNewNote}
				/>
			) : (
				<ScrollArea className="h-full pr-5 pl-5">
					<div className="flex flex-col gap-2 w-full">
						{notes.map((note) => (
							<NoteItem
								key={note.id ?? note.createdAt.toString()}
								note={note}
								onSelectNote={onSelectNote}
								onDeleteNote={onDeleteNote}
								activeNoteId={activeNoteId}
							/>
						))}
					</div>
				</ScrollArea>
			)}
		</aside>
	);
}
