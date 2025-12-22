"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Folder, Note } from "@/lib/types";
import {
	loadDemoFolders,
	loadDemoNotes,
	saveDemoFolders,
	saveDemoNotes,
} from "@/lib/note-storage";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export function useDemoNotes() {
	const [mounted, setMounted] = useState(false);

	const [rootNotes, setRootNotes] = useState<Note[]>([]);
	const [folders, setFolders] = useState<Folder[]>([]);

	const [activeNote, setActiveNote] = useState<Note | null>(null);
	const [title, setTitle] = useState("");
	const [isDirty, setIsDirty] = useState(false);


	const editorRef = useRef<HTMLDivElement>(null);
	const debounceTimer = useRef<NodeJS.Timeout | null>(null);

	const activeNoteIdRef = useRef<string | null>(null);

	const findNoteById = useCallback((id: string, currentRootNotes: Note[], currentFolders: Folder[]): Note | undefined => {
		const inRoot = currentRootNotes.find(n => n.id === id);
		if (inRoot) return inRoot;

		const findInFolders = (list: Folder[]): Note | undefined => {
			for (const folder of list) {
				const found = folder.notes.find(n => n.id === id);
				if (found) return found;
				const deepFound = findInFolders(folder.folders || []);
				if (deepFound) return deepFound;
			}
			return undefined;
		};
		return findInFolders(currentFolders);
	}, []);


	const removeNoteFromTree = (id: string, currentRootNotes: Note[], currentFolders: Folder[]) => {
		const newRootNotes = currentRootNotes.filter(n => n.id !== id);

		const recursiveRemove = (list: Folder[]): Folder[] => {
			return list.map(f => ({
				...f,
				notes: f.notes.filter(n => n.id !== id),
				folders: recursiveRemove(f.folders || [])
			}));
		};

		const newFolders = recursiveRemove(currentFolders);
		return { newRootNotes, newFolders };
	};


	const placeNoteInTree = (note: Note, currentRootNotes: Note[], currentFolders: Folder[]) => {

		if (!note.folderId) {

			const exists = currentRootNotes.find(n => n.id === note.id);
			let newRootNotes;
			if (exists) {
				newRootNotes = currentRootNotes.map(n => n.id === note.id ? note : n);
			} else {
				newRootNotes = [...currentRootNotes, note];
			}

			newRootNotes.sort((a, b) => a.title.localeCompare(b.title));
			return { newRootNotes, newFolders: currentFolders };
		}

		const recursiveUpdate = (list: Folder[]): Folder[] => {
			return list.map(f => {
				if (f.id === note.folderId) {
					const noteExists = f.notes.find(n => n.id === note.id);
					let newNotes;
					if (noteExists) {
						newNotes = f.notes.map(n => n.id === note.id ? note : n);
					} else {
						newNotes = [...f.notes, note];
					}
					return { ...f, notes: newNotes.sort((a, b) => a.title.localeCompare(b.title)) };
				}
				return { ...f, folders: recursiveUpdate(f.folders || []) };
			});
		};

		return { newRootNotes: currentRootNotes, newFolders: recursiveUpdate(currentFolders) };
	};

	const persistChanges = (newRootNotes: Note[], newFolders: Folder[]) => {
		setRootNotes(newRootNotes);
		setFolders(newFolders);
		saveDemoNotes(newRootNotes);
		saveDemoFolders(newFolders);
	};

	const saveCurrentNote = useCallback(() => {
		if (!activeNoteIdRef.current) return;

		const currentContent = editorRef.current?.innerHTML ?? "";
		const currentTitle = title.trim() === "" ? "Untitled Note" : title;

		setRootNotes(prevRoot => {
			setFolders(prevFolders => {
				const existingNote = findNoteById(activeNoteIdRef.current!, prevRoot, prevFolders);
				if (!existingNote) return prevFolders;

				const updatedNote: Note = {
					...existingNote,
					title: currentTitle,
					content: currentContent,
				};
				const { newRootNotes, newFolders } = placeNoteInTree(updatedNote, prevRoot, prevFolders);
				saveDemoNotes(newRootNotes);
				saveDemoFolders(newFolders);
				return prevFolders;
			});
			return prevRoot;
		});
		const noteToSave: Note = {
			...activeNote!,
			id: activeNoteIdRef.current!,
			title: currentTitle,
			content: currentContent
		};

		const { newRootNotes: tempRoot, newFolders: tempFolders } = removeNoteFromTree(noteToSave.id, rootNotes, folders);
		const { newRootNotes, newFolders } = placeNoteInTree(noteToSave, tempRoot, tempFolders);

		persistChanges(newRootNotes, newFolders);
		setActiveNote(noteToSave);
		setIsDirty(false);

	}, [activeNote, rootNotes, folders, title]);

	const selectNote = (note: Note) => {
		if (isDirty && activeNote) {
			saveCurrentNote();
		}

		setActiveNote(note);
		activeNoteIdRef.current = note.id;
		setTitle(note.title === "Untitled Note" ? "" : note.title);

		if (editorRef.current) {
			editorRef.current.innerHTML = note.content;
		}
		setIsDirty(false);
	};

	const createNewNote = () => {
		if (isDirty && activeNote) saveCurrentNote();

		const newNote: Note = {
			id: uuidv4(),
			title: "Untitled Note",
			content: "",
			createdAt: Date.now(),
			folderId: undefined,
		};

		const newRootNotes = [...rootNotes, newNote].sort((a,b) => a.title.localeCompare(b.title));
		persistChanges(newRootNotes, folders);

		setActiveNote(newNote);
		activeNoteIdRef.current = newNote.id;
		setTitle("");
		if (editorRef.current) editorRef.current.innerHTML = "";
		setIsDirty(false);
	};

	const createNewFolder = () => {
		const newFolder: Folder = {
			id: uuidv4(),
			title: "Untitled Folder",
			studentId: "demo",
			notes: [],
			folders: [],
		};
		const newFolders = [...folders, newFolder];
		persistChanges(rootNotes, newFolders);
	};

	const deleteNote = (id: string) => {
		const { newRootNotes, newFolders } = removeNoteFromTree(id, rootNotes, folders);
		persistChanges(newRootNotes, newFolders);

		if (activeNoteIdRef.current === id) {
			setActiveNote(null);
			activeNoteIdRef.current = null;
			setTitle("");
			if (editorRef.current) editorRef.current.innerHTML = "";
		}
		toast.success("Note deleted");
	};

	const renameNote = (note: Note, newTitle: string) => {
		const updatedNote = { ...note, title: newTitle.trim() || "Untitled Note" };

		const { newRootNotes: tempRoot, newFolders: tempFolders } = removeNoteFromTree(note.id, rootNotes, folders);
		const { newRootNotes, newFolders } = placeNoteInTree(updatedNote, tempRoot, tempFolders);

		persistChanges(newRootNotes, newFolders);

		if (activeNoteIdRef.current === note.id) {
			setActiveNote(updatedNote);
			setTitle(updatedNote.title === "Untitled Note" ? "" : updatedNote.title);
		}
	};

	const duplicateNote = (note: Note) => {
		if (isDirty && activeNote) saveCurrentNote();

		const newNote: Note = {
			...note,
			id: uuidv4(),
			title: `${note.title} (Copy)`,
			createdAt: Date.now(),

			folderId: note.folderId,
		};

		const { newRootNotes, newFolders } = placeNoteInTree(newNote, rootNotes, folders);
		persistChanges(newRootNotes, newFolders);

		setActiveNote(newNote);
		activeNoteIdRef.current = newNote.id;
		setTitle(newNote.title === "Untitled Note" ? "" : newNote.title);
		if (editorRef.current) editorRef.current.innerHTML = newNote.content;
		setIsDirty(false);
	};

	const moveNoteToFolder = (noteId: string, targetFolderId?: string) => {

		const note = findNoteById(noteId, rootNotes, folders);
		if (!note) return;

		const updatedNote = { ...note, folderId: targetFolderId || undefined };

		const { newRootNotes: tempRoot, newFolders: tempFolders } = removeNoteFromTree(noteId, rootNotes, folders);

		const { newRootNotes, newFolders } = placeNoteInTree(updatedNote, tempRoot, tempFolders);

		persistChanges(newRootNotes, newFolders);

		if (activeNoteIdRef.current === noteId) {
			setActiveNote(updatedNote);
		}
	};

	useEffect(() => {
		setMounted(true);
		const loadedNotes = loadDemoNotes();
		const loadedFolders = loadDemoFolders();
		const allFolderNoteIds = new Set<string>();
		const gatherIds = (list: Folder[]) => {
			list.forEach(f => {
				f.notes.forEach(n => allFolderNoteIds.add(n.id));
				gatherIds(f.folders || []);
			});
		};
		gatherIds(loadedFolders);

		const cleanRootNotes = loadedNotes.filter(n => !allFolderNoteIds.has(n.id));

		setRootNotes(cleanRootNotes);
		setFolders(loadedFolders);
	}, []);
	useEffect(() => {
		if (!isDirty || !activeNote) return;

		if (debounceTimer.current) clearTimeout(debounceTimer.current);

		debounceTimer.current = setTimeout(() => {
			saveCurrentNote();
		}, 2000);

		return () => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
		};
	}, [title, isDirty, activeNote, saveCurrentNote, editorRef.current?.innerHTML]);

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (isDirty && activeNote) {
				saveCurrentNote();
				e.preventDefault();
				e.returnValue = "Saving changes...";
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [isDirty, activeNote, saveCurrentNote]);


	const renameFolder = (folderId: string, newTitle: string) => {
		const recursiveRename = (list: Folder[]): Folder[] => {
			return list.map((f) => {
				if (f.id === folderId) {
					return { ...f, title: newTitle };
				}
				return { ...f, folders: recursiveRename(f.folders || []) };
			});
		};

		const newFolders = recursiveRename(folders);
		persistChanges(rootNotes, newFolders);
		toast.success("Folder renamed");
	};

	const deleteFolder = (folderId: string) => {
		const isNoteInFolder = (fId: string, notesToCheck: Note[]): boolean => {
			if (notesToCheck.some(n => n.id === activeNoteIdRef.current)) return true;
			return false;
		}

		let activeNoteDeleted = false;
		const recursiveCheck = (list: Folder[]) => {
			for (const f of list) {
				if (f.id === folderId) {
					const checkContent = (sub: Folder) => {
						if (isNoteInFolder(sub.id, sub.notes)) activeNoteDeleted = true;
						sub.folders?.forEach(checkContent);
					}
					checkContent(f);
				} else {
					recursiveCheck(f.folders || []);
				}
			}
		}
		recursiveCheck(folders);
		const recursiveDelete = (list: Folder[]): Folder[] => {
			return list
				.filter((f) => f.id !== folderId)
				.map((f) => ({ ...f, folders: recursiveDelete(f.folders || []) }));
		};

		const newFolders = recursiveDelete(folders);
		persistChanges(rootNotes, newFolders);

		if (activeNoteDeleted) {
			setActiveNote(null);
			activeNoteIdRef.current = null;
			setTitle("");
			if (editorRef.current) editorRef.current.innerHTML = "";
		}
		toast.success("Folder deleted");
	};

	const moveFolderToFolder = (folderId: string, targetParentId?: string) => {
		if (folderId === targetParentId) return;

		const findFolder = (list: Folder[]): Folder | undefined => {
			for (const f of list) {
				if (f.id === folderId) return f;
				const found = findFolder(f.folders || []);
				if (found) return found;
			}
			return undefined;
		};

		const folderToMove = findFolder(folders);
		if (!folderToMove) return;

		const isDescendant = (parent: Folder, targetId: string): boolean => {
			return (parent.folders || []).some(f => f.id === targetId || isDescendant(f, targetId));
		};
		if (targetParentId && isDescendant(folderToMove, targetParentId)) {
			toast.error("Cannot move a folder into its own sub-folder");
			return;
		}
		const recursiveRemove = (list: Folder[]): Folder[] => {
			return list
				.filter(f => f.id !== folderId)
				.map(f => ({ ...f, folders: recursiveRemove(f.folders || []) }));
		};

		const foldersWithoutTarget = recursiveRemove(folders);

		let finalFolders: Folder[];

		if (!targetParentId) {
			finalFolders = [...foldersWithoutTarget, { ...folderToMove, parentId: undefined }];
		} else {
			const recursiveInsert = (list: Folder[]): Folder[] => {
				return list.map(f => {
					if (f.id === targetParentId) {
						return {
							...f,
							folders: [...(f.folders || []), { ...folderToMove!, parentId: targetParentId }]
						};
					}
					return { ...f, folders: recursiveInsert(f.folders || []) };
				});
			};
			finalFolders = recursiveInsert(foldersWithoutTarget);
		}

		persistChanges(rootNotes, finalFolders);
		toast.success("Folder moved");
	};

	const duplicateFolder = (folder: Folder) => {
		const deepCopyFolder = (f: Folder): Folder => {
			return {
				...f,
				id: uuidv4(),
				title: f.title + " (Copy)",
				notes: f.notes.map((n) => ({ ...n, id: uuidv4(), createdAt: Date.now() })),
				folders: f.folders?.map(deepCopyFolder) || [],
			};
		};

		const newFolder = deepCopyFolder(folder);
		if (folders.some((f) => f.id === folder.id)) {
			persistChanges(rootNotes, [...folders, newFolder]);
			toast.success("Folder duplicated");
			return;
		}

		const recursiveInsert = (list: Folder[]): Folder[] => {
			return list.map((f) => {
				if (f.folders?.some((child) => child.id === folder.id)) {
					return {
						...f,
						folders: [...(f.folders || []), newFolder],
					};
				}
				return { ...f, folders: recursiveInsert(f.folders || []) };
			});
		};

		const newFolders = recursiveInsert(folders);
		persistChanges(rootNotes, newFolders);
		toast.success("Folder duplicated");
	};

	return {
		notes: rootNotes,
		folders,
		activeNote,
		setIsDirty,
		title,
		setTitle,
		editorRef,
		mounted,
		selectNote,
		duplicateNote,
		createNewNote,
		createNewFolder,
		renameNote,
		deleteNote,
		moveNoteToFolder,
		duplicateFolder,
		renameFolder,
		deleteFolder,
		moveFolderToFolder,
		saveNote: saveCurrentNote
	};
}