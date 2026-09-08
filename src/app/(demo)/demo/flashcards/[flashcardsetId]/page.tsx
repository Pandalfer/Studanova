import { FlashcardDeck } from "@/app/(loggedIn)/[uuid]/flashcards/[flashcardsetId]/page";
import { use } from "react";

interface PageProps {
  params: Promise<{ flashcardsetId: string }>;
}

export default function Page({ params }: PageProps) {
  const { flashcardsetId } = use(params);
  return (
    <FlashcardDeck
      uuid={"demo"}
      flashcardsetId={flashcardsetId}
      isDemo={true}
    />
  );
}
