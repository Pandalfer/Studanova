"use client"
import * as React from "react"

import {NoteSearcher} from "@/components/Flashcards/note-searcher";
import {use} from "react";
import {Flashcard, FlashcardSet, Note} from "@/lib/types";
import {saveFlashcard, saveFlashcardSet} from "@/lib/flashcard-actions";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
interface PageProps {
	params: Promise<{ uuid: string }>;
}
export default function FlashcardsPage({ params }: PageProps) {
	const {uuid} = use(params);
	const [note, setNote] = React.useState<Note | null>(null);
	const [aiGenerateOpen, setAiGenerateOpen] = React.useState(false);
	const router = useRouter();

	const setSelectedNote = async (note: Note | null) => {
		setNote(note)
	};

	const generateFlashcards = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!note) return;

		const formData = new FormData(e.currentTarget);
		const count = formData.get("count");

		try {
			setAiGenerateOpen(false);
			const res = await fetch("/api/flashcards/create-flashcard-ai", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					content: `Act as a flashcard creator. Return ONLY a raw JSON object. Do not include markdown formatting. Structure: { 'title': string, 'flashcards': [{ 'question': string, 'answer': string }] }. Create ${count} flashcards. Content: ${note.content}`,
				}),
			});

			if (!res.ok) throw new Error("AI generation failed");

			const data = await res.json();
			if (!Array.isArray(data.flashcards)) return;

			const flashcardSet = await saveFlashcardSet({
				title: data.title,
				description: `Flashcards generated from note: ${note.title}`,
				studentId: uuid
			} as FlashcardSet);

			for (const fc of data.flashcards) {
				await saveFlashcard(
					{ question: fc.question, answer: fc.answer, setId: flashcardSet.id } as Flashcard,
				);
			}

			router.push(`/${uuid}/flashcards/${flashcardSet.id}`);

		} catch (error) {
			console.log(error);
			toast.error("Failed to generate flashcards.");
		}

	};




	return (
		<div>
			<div className={"flex flex-row w-full justify-between items-start"}>
				<h1 className={"text-3xl font-bold text-foreground pl-5 pt-15 md:pt-5"}>Flashcard Sets</h1>
				<div className={"flex flex-row gap-5 mr-5 mt-5"}>
					<Button variant={"default"}>
						<Plus/> Create Flashcards
					</Button>
					<Dialog modal={false} open={aiGenerateOpen} onOpenChange={setAiGenerateOpen}>
						<DialogTrigger asChild>
							<Button variant="secondary">
								<Plus /> Create Flashcards Automatically
							</Button>
						</DialogTrigger>

						<DialogContent>
							<DialogTitle>Create flashcards</DialogTitle>

							<form onSubmit={generateFlashcards} className="space-y-4">
								<NoteSearcher setSelectedNote={setSelectedNote} uuid={uuid} />

								<Label className={"text-md leading-none font-semibold"}>Number of flashcards</Label>

								<Input
									name="count"
									type="number"
									placeholder="Number of flashcards"
									min={1}
									max={50}
									required
									defaultValue={5}
								/>

								<div className="flex justify-end gap-3">
									<Button type="submit" disabled={!note}>
										Generate
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>

				</div>
			</div>
		</div>
	)
}