"use client"
import * as React from "react"
import {v4 as uuidv4} from "uuid";
import {NoteSearcher} from "@/components/Flashcards/NoteSearcher";
import {use} from "react";
import {Note} from "@/lib/types";
interface PageProps {
	params: Promise<{ uuid: string }>;
}

const flashcards = [
	{
		id: uuidv4(),
		title: "Next.js",
	},
	{
		id: uuidv4(),
		title: "Next.js",
	},
	{
		id: uuidv4(),
		title: "Next.js",
	},
	{
		id: uuidv4(),
		title: "Next.js",
	},
	{
		id: uuidv4(),
		title: "Next.js",
	},
	{
		id: uuidv4(),
		title: "Next.js",
	},
	{
		id: uuidv4(),
		title: "Next.js",
	},
	{
		id: uuidv4(),
		title: "Next.js",
	},
	{
		id: uuidv4(),
		title: "Next.js",
	},
	{
		id: uuidv4(),
		title: "Next.js",
	},
]
export default function FlashcardsPage({ params }: PageProps) {
	const { uuid } = use(params);

	const setSelectedNote = (note: Note | null) => {
		return;
	}




	return (
		<NoteSearcher uuid={uuid} setSelectedNote={setSelectedNote} />
	)
}