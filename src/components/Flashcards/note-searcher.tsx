import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Check, ChevronsUpDown} from "lucide-react";
import {Command, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {ScrollArea} from "@/components/ui/scroll-area";
import {cn} from "@/lib/utils";
import * as React from "react";
import {Note} from "@/lib/types";
import {useEffect} from "react";
import {loadDemoFolders, loadDemoNotes, loadFolders, loadNotes} from "@/lib/notes/note-storage";
import {collectAllNotes} from "@/lib/notes/note-and-folder-actions";

type NoteSearcherProps = {
	uuid?: string;
	setSelectedNote: (note: Note | null) => void;
};

export function NoteSearcher({ uuid, setSelectedNote }: NoteSearcherProps) {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const isSearching = searchQuery.trim().length > 0;
	const [matchingNotes, setMatchingNotes] = React.useState<Note[]>([]); // Changed type to Note
	const workerRef = React.useRef<Worker | null>(null);
	const [notes, setNotes] = React.useState<Note[]>([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const [id, setId] = React.useState("");

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);
				const loadedNotes = uuid ? await loadNotes(uuid) : loadDemoNotes();
				const loadedFolders = uuid ? await loadFolders(uuid) : loadDemoFolders();
				setNotes([...loadedNotes, ...collectAllNotes(loadedFolders)]);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [uuid]);

	// Initialize Worker
	React.useEffect(() => {
		workerRef.current = new Worker(
			new URL("@/lib/notes/notes-search-worker.ts", import.meta.url),
		);

		workerRef.current.onmessage = (event) => {
			setMatchingNotes(event.data);
		};

		return () => {
			workerRef.current?.terminate();
		};
	}, []);

	React.useEffect(() => {
		if (workerRef.current) {
			workerRef.current.postMessage({
				searchQuery,
				notes,
				folders: [] // The working version expects this key
			});
		}
	}, [searchQuery, notes]);

	const displayNotes = isSearching ? matchingNotes : notes;

	const handleSelect = (selectedId: string) => {
		const newId = selectedId === id ? "" : selectedId;
		setId(newId);
		const foundNote = notes.find((n) => n.id === newId) || null;
		setSelectedNote(foundNote);

		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
				>
					{id
						? notes.find((note) => note.id === id)?.title
						: "Select Note..."}
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[250px] p-0">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="Search Notes..."
						className="h-9"
						value={searchQuery}
						onValueChange={setSearchQuery}
					/>
					<CommandList>
						<ScrollArea className="h-60">
							<CommandGroup className={"w-[240px]"}>
								{displayNotes.map((note) => (
									<CommandItem
										key={note.id}
										value={note.id}
										onSelect={(currentValue) => {
											handleSelect(currentValue);
										}}
										className={"cursor-pointer"}
									>
										{note.title}
										<Check
											className={cn(
												"ml-auto",
												id === note.id ? "opacity-100" : "opacity-0"
											)}
										/>
									</CommandItem>
								))}
							</CommandGroup>

							{/* FIX 3: Improved empty/loading state logic */}
							{displayNotes.length === 0 && (
								<div className="py-6 text-center text-sm">
									{isLoading ? "Loading Notes..." : "No results found."}
								</div>
							)}
						</ScrollArea>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}