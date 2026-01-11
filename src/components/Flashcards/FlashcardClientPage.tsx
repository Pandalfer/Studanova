"use client";
import * as React from "react";

import { NoteSearcher } from "@/components/Flashcards/note-searcher";
import { useEffect, useState } from "react";
import { FlashcardSet, Note } from "@/lib/types";
import {
	createFlashcardsBulk,
	saveFlashcardSet,
} from "@/lib/flashcards/flashcard-actions";
import { Button } from "@/components/ui/button";
import { Plus, Search, X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
	loadDemoFolders,
	loadDemoNotes,
	loadFolders,
	loadNotes,
} from "@/lib/notes/note-storage";
import { collectAllNotes } from "@/lib/notes/note-and-folder-actions";
import {
	FlashcardSet as FlashcardSetComponent,
} from "@/components/Flashcards/flashcard-set";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";

export default function FlashcardsHomeClient({ uuid, initialData }: { uuid: string, initialData: FlashcardSet[] }) {
	const [note, setNote] = React.useState<Note | null>(null);
	const [aiGenerateOpen, setAiGenerateOpen] = React.useState(false);
	const router = useRouter();
	const [allNotes, setAllNotes] = useState<Note[]>([]);
	const [isLoadingNotes, setIsLoadingNotes] = useState(true);
	const [flashcardSets, setFlashcardSets] = useState(initialData);
	const [filteredSets, setFilteredSets] = useState(initialData);
	const [searchQuery, setSearchQuery] = useState("");
	const workerRef = React.useRef<Worker | null>(null);

	useEffect(() => {
		workerRef.current = new Worker(
			new URL("@/lib/flashcards/flashcard-search-worker.ts", import.meta.url),
		);
		workerRef.current.onmessage = (event) => {
			setFilteredSets(event.data);
		};
		return () => workerRef.current?.terminate();
	}, []);

	// Trigger Search when query or sets change
	useEffect(() => {
		if (workerRef.current) {
			workerRef.current.postMessage({ searchQuery, sets: flashcardSets });
		}
	}, [searchQuery, flashcardSets]);

	useEffect(() => {
		const fetchNotesInBackground = async () => {
			try {
				setIsLoadingNotes(true);
				const loadedNotes = uuid ? await loadNotes(uuid) : loadDemoNotes();
				const loadedFolders = uuid
					? await loadFolders(uuid)
					: loadDemoFolders();
				setAllNotes([...loadedNotes, ...collectAllNotes(loadedFolders)]);
			} catch (err) {
				console.error("Error pre-loading notes:", err);
			} finally {
				setIsLoadingNotes(false);
			}
		};
		fetchNotesInBackground();
	}, [uuid]);

	const generateFlashcards = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!note) return;

		const formData = new FormData(e.currentTarget);
		const count = formData.get("count");

		try {
			setAiGenerateOpen(false);
			toast.promise(
				(async () => {
					// 1. AI Generation
					const res = await fetch("/api/flashcards/create-flashcard-ai", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							content: `Act as a flashcard creator. Return ONLY a raw JSON object. Do not include markdown formatting. Be concise and short. Structure: { 'title': string, 'flashcards': [{ 'question': string, 'answer': string }] }. Create ${count} flashcards. Content: ${note.content}`,
						}),
					});

					const data = await res.json();

					if (!Array.isArray(data.flashcards))
						throw new Error("Invalid AI response");

					// 2. Save the Set
					const flashcardSet = await saveFlashcardSet({
						title: data.title,
						description: `Flashcards generated from note: ${note.title}`,
						studentId: uuid,
					} as FlashcardSet);

					if (!flashcardSet?.id)
						throw new Error("Failed to retrieve the new Set ID");

					const flashcardsToSave = data.flashcards.slice(0, Number(count));
					await createFlashcardsBulk(flashcardsToSave, flashcardSet.id);

					// 4. Redirect
					router.push(`/${uuid}/flashcards/${flashcardSet.id}`);

					return data.title;
				})(),
				{
					loading: "Generating flashcards with AI...",
					error: "Failed to create flashcards. Please try again.",
				},
			);
		} catch (error) {
			console.log(error);
			toast.error("Failed to generate flashcards.");
		}
	};

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
				<div>
					<h1 className="text-2xl font-semibold mt-5 text-center sm:text-left md:mt-0">
						Flashcard Sets
					</h1>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Button variant="outline" className="flex-1 md:flex-none">
						<Plus className="mr-2 h-4 w-4" /> New Set
					</Button>

					<Dialog
						modal={false}
						open={aiGenerateOpen}
						onOpenChange={setAiGenerateOpen}
					>
						<DialogTrigger asChild>
							<Button variant="default" className="flex-1 md:flex-none">
								<Plus className="mr-2 h-4 w-4" /> AI Generate
							</Button>
						</DialogTrigger>

						<DialogContent>
							<DialogTitle>Create flashcards</DialogTitle>
							<form onSubmit={generateFlashcards} className="space-y-6 pt-4">
								<div className="space-y-2">
									<Label>Source Note</Label>
									<NoteSearcher
										setSelectedNote={setNote}
										notes={allNotes}
										isLoading={isLoadingNotes}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="count">Number of flashcards</Label>
									<Input
										id="count"
										name="count"
										type="number"
										min={1}
										max={50}
										required
										defaultValue={5}
									/>
								</div>

								<div className="flex justify-end gap-3 pt-2">
									<Button
										type="button"
										variant="ghost"
										onClick={() => setAiGenerateOpen(false)}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={!note}>
										Generate
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="mb-10 w-full">
				<InputGroup className="rounded-full h-12 text-base">
					<InputGroupInput
						className="h-12"
						placeholder="Search flashcard sets"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<InputGroupAddon className="pl-4 pr-1">
						{searchQuery ? (
							<X
								className="h-5 w-5 cursor-pointer"
								onClick={() => setSearchQuery("")}
							/>
						) : (
							<Search className="h-5 w-5 text-muted-foreground" />
						)}
					</InputGroupAddon>
				</InputGroup>
			</div>
			<div className="flex flex-col gap-3">
				{filteredSets.length > 0 ? (
					filteredSets.map((set) => (
						<FlashcardSetComponent key={set.id} uuid={uuid} {...set} />
					))
				) : (
					<div className="w-full py-24 flex flex-col items-center justify-center">
						<p className="text-lg text-foreground pb-2">
							{searchQuery ? "No sets match your search" : "No flashcard sets"}
						</p>
						{!searchQuery && (
							<div className="flex flex-col items-center justify-center text-center px-4">
								<p className="text-muted-foreground mb-6">
									Get started by creating a set manually or using AI.
								</p>
								<Button onClick={() => setAiGenerateOpen(true)}>
									<Plus className="mr-2 h-4 w-4" /> Create First Set
								</Button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
