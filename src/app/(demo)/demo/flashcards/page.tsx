"use client";
import * as React from "react";
import {FlashcardsManager} from "@/components/Flashcards/flashcard-manager";



export default function FlashcardsHomePage() {
	return <FlashcardsManager uuid={"demo"} isDemo={true} />;
}

