import clsx from "clsx";
import NotesEmptyState from "@/components/Notes/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Note } from "@/types";
import NoteItem from "./note-item";

interface NotesSidebarProps {
	notes: Note[];
	onSelectNote: (note: Note) => void;
	createNewNote?: () => void;
	onDeleteNote: (id: string) => void;
	activeNoteId?: string;
	loading?: boolean; // true while notes are loading
}

export function NotesSidebar({
	                              notes,
	                              onSelectNote,
	                              createNewNote,
	                              onDeleteNote,
	                              activeNoteId,
	                              loading = false,
                              }: NotesSidebarProps) {
	return (
		<aside className="h-screen fixed right-0 top-0 z-40 border-l bg-card transition-all duration-300 ease-in-out w-80">
			<div className="justify-center flex p-5">
				<Button onClick={createNewNote} className="aspect-square" variant="ghost">
					<SquarePen />
				</Button>
			</div>

			{loading ? (
				<ScrollArea className="h-full pr-5 pl-5">
					<div className="flex flex-col gap-2 w-full">
						{Array.from({ length: 8 }).map((_, i) => (
							<div
								key={i}
								className="w-full p-3 rounded-md bg-popover animate-pulse flex items-center"
							>
								<Skeleton className="h-6 w-full rounded-md bg-popover" />
							</div>
						))}
					</div>
				</ScrollArea>
			) : notes.length === 0 ? (
				<NotesEmptyState
					message="No notes yet"
					buttonText="Create your first note"
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
