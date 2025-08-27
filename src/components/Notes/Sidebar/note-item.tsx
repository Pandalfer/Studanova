import { Note } from "@/types";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function NoteItem({
	                                 note,
	                                 activeNoteId,
	                                 onSelectNote,
	                                 onDeleteNote,
                                 }: {
	note: Note;
	activeNoteId?: string;
	onSelectNote: (note: Note) => void;
	onDeleteNote: (id: string) => void;
}) {
	const [dialogOpen, setDialogOpen] = useState(false);

	// tiny helper to clear any stuck pointer-events on <body>
	const clearBodyPointerEvents = () => {
		// defer to end of tick to let Radix finish unmounting
		setTimeout(() => {
			if (document.body && document.body.style.pointerEvents === "none") {
				document.body.style.pointerEvents = "";
			}
		}, 50);
	};
	return (

	<>
			<ContextMenu modal={false}>
				<ContextMenuTrigger asChild>
					<div
						className={`w-full p-3 rounded-md cursor-pointer transition-colors ${
							activeNoteId === note.id
								? "bg-primary text-primary-foreground shadow-xs dark:hover:bg-primary/90"
								: "dark:hover:bg-accent"
						}`}
						onClick={() => onSelectNote(note)}
					>
						<h3 className="font-medium">
							{note.title.substring(0, 25)}
							{note.title.length > 25 ? "..." : ""}
						</h3>
					</div>
				</ContextMenuTrigger>

				<ContextMenuContent className="w-36 rounded-md shadow-lg">
					<AlertDialog
						open={dialogOpen}
						onOpenChange={(open) => {
							setDialogOpen(open);
							if (!open) clearBodyPointerEvents(); // ✅ belt & braces
						}}
					>
						<AlertDialogTrigger asChild>
							<ContextMenuItem
								className="text-destructive dark:hover:bg-destructive-bg focus:bg-popover transition-colors duration-300 cursor-pointer"
								onSelect={(e) => {
									// keep the menu from interfering while the dialog opens
									e.preventDefault();
									setDialogOpen(true);
								}}
							>
								<Trash2 className="h-4 w-4 mr-2" /> Delete
							</ContextMenuItem>
						</AlertDialogTrigger>

						<AlertDialogContent
							// optional: avoid weird refocus back to the menu anchor
							onCloseAutoFocus={(e) => e.preventDefault()}
						>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will permanently delete your note and remove your data from our servers.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel
									onClick={() => {
										setDialogOpen(false);
										clearBodyPointerEvents();
									}}
								>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => {
										onDeleteNote(note.id);
										setDialogOpen(false);
										clearBodyPointerEvents();
									}}
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</ContextMenuContent>
			</ContextMenu>
		</>
	);
}
