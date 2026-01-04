// @/components/Flashcards/flashcard-set.tsx
import { FlashcardSet as FlashcardSetType } from "@/lib/types";
import { Layers, ChevronRight } from "lucide-react";
import Link from "next/link";

export function FlashcardSet({ uuid, ...set }: FlashcardSetType & { uuid: string }) {
	return (
		<Link
			href={`/${uuid}/flashcards/${set.id}`}
			className="group block p-5 bg-card border rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200"
		>
			<div className="flex justify-between items-end mb-3">
				<div></div>
				<ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
			</div>

			<h2 className="text-xl font-bold text-card-foreground mb-1 truncate">
				{set.title}
			</h2>

			{set.description && (
				<p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
					{set.description}
				</p>
			)}

			<div className="pt-4 border-t flex items-center justify-between">
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
          {set.flashcards?.length || 0} Cards
        </span>
			</div>
		</Link>
	);
}

export function FlashcardSetSkeleton() {
	return (
		<div className="p-5 border rounded-xl animate-pulse bg-muted/10">
			<div className="flex justify-between mb-3">
				<div></div>
				<div className="h-5 w-5 bg-popover rounded" />
			</div>
			<div className="h-6 w-3/4 bg-popover rounded mb-2" />
			<div className="h-4 w-full bg-popover rounded mb-1" />
			<div className="h-4 w-2/3 bg-popover rounded mb-5" />
			<div className="h-8 w-20 bg-popover rounded-full pt-4" />
		</div>
	);
}