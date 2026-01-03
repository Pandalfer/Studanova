"use client";

import {usePathname} from "next/navigation";
import {Flashcard} from "@/lib/types";
import {use, useEffect, useState} from "react";
import {loadFlashcards} from "@/lib/flashcard-actions";
interface PageProps {
	params: Promise<{ uuid: string }>;
}
export default function FlashcardsetPage({ params }: PageProps) {
	const {uuid} = use(params);
	const pathname = usePathname();
	const pathSegments = pathname.split("/");
	const flashcardsetIdFromPath = pathSegments[3]; // /uuid/flashcards/flashcardsetId
	const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

	useEffect(() => {
		const fetchCards = async () => {
			try {
				const data = await loadFlashcards(flashcardsetIdFromPath, uuid);
				// 2. Fallback to empty array if data is null/undefined
				setFlashcards(data ?? []);
			} catch (error) {
				console.error("Failed to fetch:", error);
				setFlashcards([]); // 3. Reset to empty array on error to prevent crash
			}
		};
		fetchCards();
	}, [flashcardsetIdFromPath, uuid]);

	return (
		<div className="p-8 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">Flashcard Set</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{flashcards.length > 0 ? (
					flashcards.map((fc) => (
						<div key={fc.id} className="p-6 bg-card border rounded-xl shadow-sm space-y-2">
							<div className="text-sm font-bold uppercase text-muted-foreground">Question</div>
							<p className="text-lg">{fc.question}</p>
							<hr className="my-4"/>
							<div className="text-sm font-bold uppercase text-muted-foreground">Answer</div>
							<p className="text-foreground/80">{fc.answer}</p>
						</div>
					))
				) : (
					<p className="text-muted-foreground italic">No flashcards found in this set.</p>
				)}
			</div>
		</div>
	)

}