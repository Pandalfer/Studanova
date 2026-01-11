import { FlashcardSetSkeleton } from "@/components/Flashcards/flashcard-set";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{/* Skeleton for Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
				<Skeleton className="h-8 w-48" />
				<div className="flex gap-3">
					<Skeleton className="h-10 w-24 rounded-md" />
					<Skeleton className="h-10 w-32 rounded-md" />
				</div>
			</div>

			{/* Skeleton for Search Bar */}
			<div className="mb-10 w-full">
				<Skeleton className="h-12 w-full rounded-full" />
			</div>

			{/* Skeleton for the List */}
			<div className="flex flex-col gap-3">
				{Array.from({ length: 4 }).map((_, i) => (
					<FlashcardSetSkeleton key={i} />
				))}
			</div>
		</div>
	);
}