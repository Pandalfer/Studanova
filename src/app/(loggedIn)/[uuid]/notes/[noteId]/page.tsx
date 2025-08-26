"use client";

import { Note } from "@/types";
import { useEffect, useState, useRef, use } from "react";
import { loadNotes, saveNoteToDb, deleteNoteFromDb } from "@/lib/note-storage";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import NotesEditor from "@/components/Notes/notes-editor";
import { nanoid } from "nanoid";
import { useRouter, usePathname } from "next/navigation";

interface PageProps {
	params: Promise<{ uuid: string }>;
}

export default function NotesPage({ params }: PageProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { uuid } = use(params);

	const [mounted, setMounted] = useState(false);
	const [notes, setNotes] = useState<Note[]>([]);
	const [activeNote, setActiveNote] = useState<Note | null>(null);
	const [title, setTitle] = useState("");
	const [isDirty, setIsDirty] = useState(false);
	const [loadingNotes, setLoadingNotes] = useState(true);

	const editorRef = useRef<HTMLDivElement>(null);
	const debounceTimer = useRef<NodeJS.Timeout | null>(null);

	// Extract noteId from URL
	const pathSegments = pathname.split("/");
	const noteIdFromPath = pathSegments[3]; // /uuid/notes/noteId

	useEffect(() => setMounted(true), []);

	// Auto-save effect
	useEffect(() => {
		if (!isDirty || !activeNote) return;

		if (debounceTimer.current) clearTimeout(debounceTimer.current);

		debounceTimer.current = setTimeout(async () => {
			if (!activeNote) return;

			const updatedNote: Note = {
				...activeNote,
				title: title.trim() || "Untitled Note",
				content: editorRef.current?.innerHTML ?? activeNote.content,
			};

			try {
				const savedNote = await saveNoteToDb(updatedNote, uuid);
				if (savedNote) {
					setNotes((prev) =>
						prev.map((n) => (n.id === savedNote.id ? savedNote : n))
					);
					setActiveNote(savedNote);
					setIsDirty(false);
				}
			} catch (error) {
				console.error("Auto-save failed:", error);
			}
		}, 2000);

		return () => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
		};
	}, [title, editorRef.current?.innerHTML, isDirty, activeNote, uuid]);

	// Warn before leaving with unsaved changes
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (isDirty) {
				e.preventDefault();
				e.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [isDirty]);

	// Load notes
	useEffect(() => {
		(async () => {
			setLoadingNotes(true);
			const loadedNotes = await loadNotes(uuid);
			setNotes(loadedNotes);

			if (noteIdFromPath) {
				const match = loadedNotes.find((n) => n.id === noteIdFromPath);
				if (match) {
					setActiveNote(match);
					setTitle(match.title);
					if (editorRef.current) editorRef.current.innerHTML = match.content;
				}
			}
			setLoadingNotes(false);
		})();
	}, [uuid, noteIdFromPath]);

	const selectNote = async (note: Note) => {
		// Save current note if dirty
		if (isDirty && activeNote) {
			const updatedNote: Note = {
				...activeNote,
				title: title.trim() || "Untitled Note",
				content: editorRef.current?.innerHTML ?? activeNote.content,
			};
			try {
				const savedNote = await saveNoteToDb(updatedNote, uuid);
				if (savedNote) setNotes((prev) =>
					prev.map((n) => (n.id === savedNote.id ? savedNote : n))
				);
			} catch (err) {
				console.error("Failed to save before switching note:", err);
			}
		}

		setActiveNote(note);
		setTitle(note.title);
		if (editorRef.current) editorRef.current.innerHTML = note.content;
		setIsDirty(false);

		router.push(`/${uuid}/notes/${note.id}`);
	};

	const createNewNote = async () => {
		const newNote: Note = {
			id: nanoid(),
			title: "Untitled Note",
			content: "",
			createdAt: Date.now(),
		};

		setNotes((prev) => [...prev, newNote]);
		setActiveNote(newNote);
		setTitle(newNote.title);
		if (editorRef.current) editorRef.current.innerHTML = "";

		setIsDirty(false);
		router.push(`/${uuid}/notes/${newNote.id}`);

		saveNoteToDb(newNote, uuid).catch(console.error);
	};

	const deleteNote = async (id: string) => {
		await deleteNoteFromDb(id);
		setNotes((prev) => prev.filter((n) => n.id !== id));

		if (activeNote?.id === id) {
			setActiveNote(null);
			setTitle("");
			if (editorRef.current) editorRef.current.innerHTML = "";
		}
	};

	if (!mounted) return null;

	return (
		<div className="flex min-h-screen">
			<NotesSidebar
				notes={notes}
				onSelectNote={selectNote}
				createNewNote={createNewNote}
				onDeleteNote={deleteNote}
				activeNoteId={activeNote?.id}
				loading={loadingNotes}
			/>

			<div className="flex-1 h-screen">
				{activeNote && (
					<NotesEditor
						note={activeNote}
						title={title}
						setTitle={setTitle}
						editorRef={editorRef}
						onDirtyChange={setIsDirty}
						loading={loadingNotes}
					/>
				)}
			</div>
		</div>
	);
}
