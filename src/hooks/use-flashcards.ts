import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {useEffect, useState} from "react";
import {Flashcard, FlashcardSet} from "@/lib/types";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {loadFlashcards, loadFlashcardSets, resetDeckProgress, saveFlashcard} from "@/lib/flashcards/flashcard-actions";
import {useIsDesktop} from "@/lib/utils";

export function useFlashcards(
	uuid: string,
	router: AppRouterInstance,
	flashcardsetIdFromPath?: string,
) {
	const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
	const [trackedFlashcards, setTrackedFlashcards] = useState<Flashcard[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
	const [activeFlashcard, setActiveFlashcard] = useState<number>(0);
	const [trackProgress, setTrackProgress] = useState(true);

	const isDesktop = useIsDesktop();

	const isFirst = activeFlashcard === 0;
	const isLast = activeFlashcard === flashcards.length - 1;

	const changeFlashcard = (direction: "next" | "prev") => {
		if (direction === "next" && !isLast) setActiveFlashcard((prev) => prev + 1);
		if (direction === "prev" && !isFirst)
			setActiveFlashcard((prev) => prev - 1);
	};

	const handleResetDeck = async () => {
		if (!flashcardSet?.id) return;

		toast.promise(
			(async () => {
				// 1. Reset in Database
				await resetDeckProgress(flashcardSet.id!);

				// 2. Reset Local State
				setFlashcards((prev) => prev.map((fc) => ({ ...fc, progress: 0 })));
				setTrackedFlashcards(flashcards.map((fc) => ({ ...fc, progress: 0 })));
				setActiveFlashcard(0);

				return "Deck reset!";
			})(),
			{
				loading: "Resetting progress...",
				success: (msg) => msg,
				error: "Could not reset deck.",
			},
		);
	};

	const shuffleFlashcards = () => {
		const shuffle = (cards: Flashcard[]) => {
			const newCards = [...cards];
			let currentIndex = newCards.length;
			while (currentIndex !== 0) {
				const randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex--;
				[newCards[currentIndex], newCards[randomIndex]] = [
					newCards[randomIndex],
					newCards[currentIndex],
				];
			}

			return newCards;
		};
		trackProgress
			? setTrackedFlashcards((prevCards) => {
				return shuffle(prevCards);
			})
			: setFlashcards((prevCards) => {
				return shuffle(prevCards);
			});

		toast.success("Flashcards shuffled!");
	};

	const fetchCards = async () => {
		if (!flashcardsetIdFromPath || !uuid) return;

		setLoading(true);
		try {
			// 1. Just call the specific loader
			const data = await loadFlashcards(flashcardsetIdFromPath, uuid);

			if (data) {
				setFlashcardSet(data);
				const cards = data.flashcards ?? [];
				setFlashcards(cards);
				// If the DB returns progress, filter them out
				setTrackedFlashcards(cards.filter((fc) => fc.progress !== 1));
			} else {
				// If data is null, the ID was wrong
				router.push(`/${uuid}/flashcards`);
			}
		} catch (error) {
			// This is likely where your "Unexpected Token <" is caught
			console.error("Fetch Error:", error);
			toast.error("Session expired or connection lost. Please refresh.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCards();
	}, [flashcardsetIdFromPath, uuid]);

	const trackedFlashcardRight = async (flashcard: Flashcard) => {
		// 1. Optimistically update UI: Remove from the queue immediately
		setTrackedFlashcards((prev) => prev.filter((f) => f.id !== flashcard.id));

		try {
			// 2. Persist to DB
			await saveFlashcard({ ...flashcard, progress: 1 });
		} catch (err) {
			toast.error("Failed to save progress");
			// Optional: Re-add to queue if save fails
			setTrackedFlashcards((prev) => [...prev, flashcard]);
		}
	};

	const trackedFlashcardWrong = async (flashcard: Flashcard) => {
		setTrackedFlashcards((prev) => {
			const withoutCurrent = prev.filter((f) => f.id !== flashcard.id);
			const offset = Math.floor(Math.random() * 3) + 2;
			const insertIndex = Math.min(offset, withoutCurrent.length);
			return [
				...withoutCurrent.slice(0, insertIndex),
				flashcard,
				...withoutCurrent.slice(insertIndex),
			];
		});

		try {
			await saveFlashcard({ ...flashcard, progress: 0 });
		} catch (err) {
			console.error(err);
		}
	};

	return {
		flashcards,
		trackedFlashcards,
		loading,
		flashcardSet,
		activeFlashcard,
		isFirst,
		isLast,
		changeFlashcard,
		handleResetDeck,
		shuffleFlashcards,
		trackProgress,
		setTrackProgress,
		trackedFlashcardRight,
		trackedFlashcardWrong,
		isDesktop,
	}
}