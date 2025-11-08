"use client"

import {useEffect, useRef, useState} from "react";
import {Folder, Note} from "@/lib/types";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {loadFolders, loadNotes, saveNoteToDb} from "@/lib/note-storage";
import {
	collectAllNotes, createNewFolder,
	createNewNote, deleteNote, duplicateFolder, duplicateNote,
	moveFolder,
	moveNote, renameFolder, renameNote,
	renameNoteInFolders, selectNote
} from "@/lib/notes/note-and-folder-actions";

export function useNotes(uuid: string, router: AppRouterInstance, noteIdFromPath?: string,) {
	const [notes, setNotes] = useState<Note[]>([]);
	const [folders, setFolders] = useState<Folder[]>([]);
	const [activeNote, setActiveNote] = useState<Note | null>(null);
	const [title, setTitle] = useState("");
	const [isDirty, setIsDirty] = useState(false);
	const [loading, setLoading] = useState(true);
	const editorRef = useRef<HTMLDivElement>(null);
	const debounceTimer = useRef<NodeJS.Timeout | null>(null);


	// Load notes and folders
	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const loadedNotes = await loadNotes(uuid);
				const loadedFolders = await loadFolders(uuid);
				setNotes(loadedNotes);
				setFolders(loadedFolders);

				if(noteIdFromPath) {
					const allNotes = [...loadedNotes, ...collectAllNotes(loadedFolders)];
					const found = allNotes.find(n => n.id === noteIdFromPath);
					if(found) {
						setActiveNote(found);
						setTitle(found.title === "Untitled Note" ? "" : found.title);
						if(editorRef.current) editorRef.current.innerHTML = found.content;
					}
				}
			} finally {
				setLoading(false);
			}
		})();
	}, [uuid, noteIdFromPath]);

	// Auto Save Notes
	useEffect(() => {
		if (!isDirty || !activeNote) return;

		if (debounceTimer.current) clearTimeout(debounceTimer.current);

		debounceTimer.current = setTimeout(async () => {
			const updatedNote: Note = {
				...activeNote,
				title: title.trim() || "Untitled Note",
				content: editorRef.current?.innerHTML ?? activeNote.content,
			};

			try {
				const savedNote = await saveNoteToDb(updatedNote, uuid);
				if (savedNote) {
					if (!savedNote.folderId) {
						// Root-level note
						setNotes((prev) =>
							prev.map((n) => (n.id === savedNote.id ? savedNote : n)),
						);
					} else {
						setFolders((prev) => renameNoteInFolders(prev, savedNote));
					}

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
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [isDirty]);

	return {
		notes,
		folders,
		activeNote,
		title,
		setTitle,
		isDirty,
		setIsDirty,
		loading,
		editorRef,
		setActiveNote,
		moveNoteToFolder: (noteId: string, folderId?: string) =>
			moveNote(setNotes, setFolders, folders, noteId, uuid, folderId),
		moveFolderToFolder: (folderId: string, parentId?: string) =>
			moveFolder(folderId, setFolders, folders, uuid, parentId),
		onCreateNewNote: () =>
			createNewNote(uuid, router, notes, setNotes, setActiveNote, setTitle, editorRef, setIsDirty),
		onCreateNewFolder: () => createNewFolder(uuid, setFolders),
		onDuplicateNote: (note: Note) => duplicateNote(note, uuid, setFolders, setNotes),
		onDuplicateFolder: (folder: Folder) => duplicateFolder(folder, uuid, setFolders),
		onDeleteNote: (id: string) =>
			deleteNote(id, notes, setNotes, setFolders, editorRef, setTitle, router, setActiveNote, activeNote, uuid),
		onRenameNote: (note: Note, newTitle: string) =>
			renameNote(note, newTitle, uuid, setNotes, setFolders, activeNote, setActiveNote, setTitle),
		onRenameFolder: (folder: Folder, newTitle: string) =>
			renameFolder(folder, newTitle, uuid, setFolders),
		onSelectNote: (note: Note) =>
			selectNote(note, uuid, router, activeNote, isDirty, title, editorRef, setActiveNote, setTitle, setNotes),
	}
}