import {EditFlashcards} from "@/app/(loggedIn)/[uuid]/flashcards/[flashcardsetId]/edit/page";
import {use} from "react";

interface PageProps {
	params: Promise<{flashcardsetId: string;}>;
}

export default function Edit({params}: PageProps) {
	const {flashcardsetId} = use(params);
	return <EditFlashcards uuid={"demo"} flashcardsetId={flashcardsetId} isDemo={true} />;
}