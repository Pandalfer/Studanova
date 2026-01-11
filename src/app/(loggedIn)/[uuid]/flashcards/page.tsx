import { loadFlashcardSets } from "@/lib/server-actions/flashcards";
import FlashcardsHomeClient from "@/components/Flashcards/FlashcardClientPage";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default async function FlashcardsPage({ params }: PageProps) {
  const { uuid } = await params;
  const initialSets = await loadFlashcardSets(uuid);
  return <FlashcardsHomeClient uuid={uuid} initialData={initialSets} />;
}