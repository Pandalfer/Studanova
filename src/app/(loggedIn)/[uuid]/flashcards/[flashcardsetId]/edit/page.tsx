"use client";

import { useRouter } from "next/navigation";
import {useState, useEffect, useRef, use} from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
	loadFlashcardSet,
	saveFlashcardsBulk,
	saveFlashcardSet
} from "@/lib/server-actions/flashcards";
import {
	loadFlashcardSetDemo,
	saveFlashcardsBulkDemo,
	saveFlashcardSetDemo
} from "@/lib/flashcards/flashcard-actions";
import { Flashcard } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface EditFlashcardsProps {
	uuid: string;
	flashcardsetId: string;
	isDemo?: boolean;
}

interface PageProps {
	params: Promise<{
		uuid: string;
		flashcardsetId: string;
	}>;
}

export default function EditPage({ params }: PageProps) {
	const { uuid, flashcardsetId } = use(params);
	return <EditFlashcards uuid={uuid} flashcardsetId={flashcardsetId} isDemo={false} />;
}

export function EditFlashcards({ uuid, flashcardsetId, isDemo = false }: EditFlashcardsProps) {
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
	const flashcardsToDelete = useRef<string[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				// Branching Load
				const data = isDemo
					? await loadFlashcardSetDemo(flashcardsetId)
					: await loadFlashcardSet(flashcardsetId, uuid);

				if (data.success && data.data) {
					setTitle(data.data.title || "");
					setDescription(data.data.description || "");
					const cards = data.data.flashcards || [];
					setFlashcards(cards);
					flashcardsToDelete.current = cards
						.map(c => c.id)
						.filter((id): id is string => !!id);
				} else {
					toast.error("Failed to load flashcard set");
					router.push(`/${uuid}/flashcards`);
				}
			} catch (error) {
				console.error("Load error:", error);
				toast.error("Failed to load flashcard set");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [flashcardsetId, uuid, router, isDemo]);

	const handleSave = async () => {
		const validFlashcards = flashcards.filter(
			card => card.question.trim() !== "" && card.answer.trim() !== ""
		);
		const currentIds = validFlashcards.map(f => f.id);
		const idsToDelete = flashcardsToDelete.current.filter(id => !currentIds.includes(id));

		if (validFlashcards.length === 0) {
			toast.error("Please add at least one flashcard with both term and definition");
			return;
		}

		setSaving(true);
		try {
			// Branching Save (Set Details)
			const setRes = isDemo
				? await saveFlashcardSetDemo(flashcardsetId, { title, description })
				: await saveFlashcardSet(flashcardsetId, { title, description });

			// Branching Save (Cards Bulk)
			const cardsRes = isDemo
				? await saveFlashcardsBulkDemo(validFlashcards, idsToDelete)
				: await saveFlashcardsBulk(validFlashcards, idsToDelete);

			if (setRes.success && cardsRes.success) {
				toast.success("Everything saved!");
				const updatedData = isDemo
					? await loadFlashcardSetDemo(flashcardsetId)
					: await loadFlashcardSet(flashcardsetId, uuid);
				if (updatedData.success && updatedData.data) {
					setFlashcards(updatedData.data.flashcards || []);
					flashcardsToDelete.current = (updatedData.data.flashcards || [])
						.map(c => c.id)
						.filter((id): id is string => !!id);
				}
			} else {
				toast.error("Failed to save some changes");
			}
		} catch (error) {
			console.error("Save error:", error);
			toast.error("An unexpected error occurred while saving");
		} finally {
			setSaving(false);
		}
	};

	const addFlashcard = () => {
		const newCard: Flashcard = {
			id: `temp-${Date.now()}`,
			question: "",
			answer: "",
			progress: 0,
			setId: flashcardsetId,
		};
		setFlashcards([...flashcards, newCard]);
	};

	const removeFlashcard = (index: number) => {
		setFlashcards(flashcards.filter((_, i) => i !== index));
	};

	const updateFlashcard = (index: number, field: "question" | "answer", value: string) => {
		const updated = [...flashcards];
		updated[index] = { ...updated[index], [field]: value };
		setFlashcards(updated);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background p-4 md:p-6">
				<div className="max-w-4xl mx-auto space-y-6">
					<Skeleton className="h-10 w-32 md:w-48" />
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-40 w-full" />
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background p-4 md:p-6">
			<div className="mx-auto space-y-6">
				<div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 py-4">
					<div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => router.push(`/${uuid}/flashcards/${flashcardsetId}${isDemo ? '?demo=true' : ''}`)}
							className="gap-2 shrink-0"
						>
							<ArrowLeft className="h-4 w-4" />
							<span className="hidden xs:inline">Back to Study</span>
							<span className="xs:hidden">Back</span>
						</Button>
						<Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
							<Save className="h-4 w-4" />
							<span>{saving ? "Saving..." : "Save Changes"}</span>
						</Button>
					</div>
				</div>

				<div className="max-w-4xl mx-auto space-y-6">
					<Card className="p-4 md:p-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Enter set title"
								className="text-lg md:text-2xl font-bold h-10 md:h-12"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Enter set description (optional)"
								className="min-h-[80px] resize-none !bg-card"
							/>
						</div>
					</Card>

					<div className="space-y-4">
						{flashcards.map((card, index) => (
							<Card key={card.id} className="p-4 md:p-6 relative">
								<div className="flex flex-col md:flex-row items-start gap-4">
									<div className="flex items-center justify-between w-full md:w-auto">
										<div className="w-8 h-8 rounded-full bg-popover flex items-center justify-center font-semibold text-sm shrink-0">
											{index + 1}
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => removeFlashcard(index)}
											className="md:hidden text-destructive"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>

									<div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
										<div className="space-y-2">
											<Label htmlFor={`term-${index}`}>Term</Label>
											<Textarea
												id={`term-${index}`}
												value={card.question}
												onChange={(e) => updateFlashcard(index, "question", e.target.value)}
												placeholder="Enter term"
												className="min-h-[100px] md:min-h-[120px] resize-none"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor={`definition-${index}`}>Definition</Label>
											<Textarea
												id={`definition-${index}`}
												value={card.answer}
												onChange={(e) => updateFlashcard(index, "answer", e.target.value)}
												placeholder="Enter definition"
												className="min-h-[100px] md:min-h-[120px] resize-none"
											/>
										</div>
									</div>

									<Button
										variant="ghost"
										size="icon"
										onClick={() => removeFlashcard(index)}
										className="hidden md:flex flex-shrink-0"
									>
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
								</div>
							</Card>
						))}
					</div>

					<Button
						variant="outline"
						onClick={addFlashcard}
						className="w-full h-14 md:h-16 border-dashed"
					>
						<Plus className="mr-2 h-5 w-5" />
						Add Flashcard
					</Button>
				</div>
			</div>
		</div>
	);
}