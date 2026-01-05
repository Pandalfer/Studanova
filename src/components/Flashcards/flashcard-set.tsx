
import { FlashcardSet as FlashcardSetType } from "@/lib/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {useIsDesktop} from "@/lib/utils";

export function FlashcardSet({ uuid, ...set }: FlashcardSetType & { uuid: string }) {
	const isDesktop = useIsDesktop();
	return (
		<Link
			href={`/${uuid}/flashcards/${set.id}`}
			className="
        group/card flex items-center justify-between
        px-6 py-4
        bg-card
        border rounded-xl
        hover:border-primary
        transition
     "
		>
			<div className="min-w-0 flex-1">
				<h2 className="text-base font-semibold truncate">
					{isDesktop ? set.title : set.title.length > 20 ? set.title.slice(0, 20) + "..." : set.title}
				</h2>

				{set.description && (
					<p className="text-sm text-muted-foreground line-clamp-1 mt-1">
						{set.description}
					</p>
				)}
			</div>

			<div className="flex items-center gap-4 shrink-0">
        <span className="text-sm text-muted-foreground">
          {set.flashcards?.length || 0} cards
        </span>
				<ChevronRight
					size={18}
					className="text-muted-foreground transition-transform group-hover/card:translate-x-3 duration-300"
				/>
			</div>
		</Link>
	);
}

export function FlashcardSetSkeleton() {
	return (
		<div className="flex items-center justify-between px-6 py-4.5 border rounded-xl animate-pulse bg-card/50">
			<div className="min-w-0 flex-1">
				<div className="h-5 w-2/3 max-w-[250px] bg-popover rounded mb-2" />
				<div className="h-4 w-3/4 max-w-[400px] bg-popover rounded" />
			</div>

			<div className="flex items-center gap-4 shrink-0 ml-4">
				<div className="h-4 w-16 bg-popover rounded" />
				<ChevronRight size={18} className="text-muted-foreground/20" />
			</div>
		</div>
	);
}