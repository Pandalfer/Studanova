import { Folder, FolderInput, ImportFolder, Note } from "@/lib/types";
import {
  deleteFolderFromDb,
  deleteNoteFromDb,
  saveFolderToDb,
  saveNoteToDb,
} from "@/lib/notes/note-storage";
import React from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

//region URL Actions

const getNoteUrl = (userId: string, noteId: string) => {
  return `${window.location.origin}/${userId}/notes/${noteId}`;
};

export const copyUrlToClipboard = async (userId: string, noteId: string) => {
  const url = getNoteUrl(userId, noteId);
  const textArea = document.createElement("textarea");
  textArea.value = url;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
};

export const openNoteInNewTab = (userId: string, noteId: string) => {
  const url = getNoteUrl(userId, noteId);
  window.open(url, "_blank");
};

//endregion
//region Logged In Actions
//region Note Actions
export function collectAllNotes(folders: Folder[]): Note[] {
  const notes: Note[] = [];
  traverseFolders(folders, (folder) => {
    notes.push(...(folder.notes ?? []));
  });
  return sortByTitle(notes);
}

export function deleteNoteFromFolders(
  folders: Folder[],
  noteId: string,
): Folder[] {
  return mapFolders(folders, (folder) => ({
    ...folder,
    notes: (folder.notes ?? []).filter((n) => n.id !== noteId),
  }));
}

export function renameNoteInFolders(
  folders: Folder[],
  updatedNote: Note,
): Folder[] {
  return mapFolders(folders, (folder) => ({
    ...folder,
    notes: sortByTitle(
      (folder.notes ?? []).map((n) =>
        n.id === updatedNote.id ? updatedNote : n,
      ),
    ),
  }));
}

export function moveNote(
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
  folders: Folder[],
  noteId: string,
  uuid: string,
  folderId?: string,
) {
  setNotes((prevNotes) => {
    const allNotes = [...prevNotes, ...collectAllNotes(folders)];
    const note = allNotes.find((n) => n.id === noteId);
    if (!note) return prevNotes;

    const updatedNote: Note = { ...note, folderId };
    try {
      saveNoteToDb(updatedNote, uuid);
    } catch (err) {
      toast.error("Failed to move note");
      console.error("Failed to move note in DB:", err);
      return prevNotes;
    }

    let nextNotes: Note[];

    if (folderId) {
      // Moving into a flashcards → remove from root
      nextNotes = prevNotes.filter((n) => n.id !== noteId);
    } else {
      // Moving to root
      const isInRoot = prevNotes.some((n) => n.id === noteId);
      nextNotes = isInRoot
        ? prevNotes.map((n) => (n.id === noteId ? updatedNote : n))
        : [...prevNotes, updatedNote];
    }

    // update folders tree
    setFolders((prevFolders) => {
      const updateFolders = (folders: Folder[]): Folder[] =>
        folders.map((folder) => {
          const cleanedNotes = (folder.notes ?? []).filter(
            (n) => n.id !== noteId,
          );

          if (folder.id === folderId) {
            return {
              ...folder,
              notes: sortByTitle([...cleanedNotes, updatedNote]),
              folders: updateFolders(folder.folders ?? []),
            };
          }

          return {
            ...folder,
            notes: sortByTitle(cleanedNotes),
            folders: updateFolders(folder.folders ?? []),
          };
        });

      return updateFolders(prevFolders);
    });

    return sortByTitle(nextNotes);
  });
}

export async function duplicateNote(
  note: Note,
  uuid: string,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
): Promise<void> {
  const newNote: Note = {
    id: nanoid(),
    title: note.title + " (Copy)",
    content: note.content,
    folderId: note.folderId ?? undefined,
  };

  try {
    await saveNoteToDb(newNote, uuid);
  } catch (err) {
    toast.error("Failed to duplicate note");
    console.error("Failed to duplicate note in DB:", err);
    return;
  }

  if (newNote.folderId) {
    setFolders((prevFolders) => {
      const updateFolders = (folders: Folder[]): Folder[] =>
        folders.map((folder) => {
          if (folder.id === newNote.folderId) {
            return {
              ...folder,
              notes: sortByTitle([...(folder.notes ?? []), newNote]),
            };
          }

          return {
            ...folder,
            folders: updateFolders(folder.folders ?? []),
          };
        });
      return updateFolders(prevFolders);
    });
  } else {
    setNotes((prev) => sortByTitle([...prev, newNote]));
  }
}

export async function deleteNote(
  id: string,
  notes: Note[],
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
  editorRef?: React.RefObject<HTMLDivElement | null>,
  setTitle?: React.Dispatch<React.SetStateAction<string>>,
  router?: AppRouterInstance,
  setActiveNote?: React.Dispatch<React.SetStateAction<Note | null>>,
  activeNote?: Note | null,
  uuid?: string,
): Promise<void> {
  try {
    await deleteNoteFromDb(id);
  } catch (err) {
    toast.error("Failed to delete note");
    console.error("Failed to delete note from DB:", err);
  }

  // Active note logic
  if (activeNote?.id === id) {
    setActiveNote?.(null);
    setTitle?.("");
    if (editorRef?.current) editorRef.current.innerHTML = "";
    router?.push(`/${uuid}/notes`);
  }

  // Remove note from state
  const noteToDelete = notes.find((n) => n.id === id);
  if (noteToDelete) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  } else {
    setFolders((prev) => deleteNoteFromFolders(prev, id));
  }
}

export async function renameNote(
  note: Note,
  newTitle: string,
  uuid: string,
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
  activeNote?: Note | null,
  setActiveNote?: React.Dispatch<React.SetStateAction<Note | null>>,
  setTitle?: React.Dispatch<React.SetStateAction<string>>,
) {
  const updatedNote: Note = {
    ...note,
    title: newTitle.trim() || "Untitled Note",
  };
  try {
    const savedNote = await saveNoteToDb(updatedNote, uuid);
    if (!savedNote) return;
    if (!savedNote.folderId) {
      setNotes((prev) =>
        sortByTitle(prev.map((n) => (n.id === savedNote.id ? savedNote : n))),
      );
    } else {
      setFolders((prev) => renameNoteInFolders(prev, savedNote));
    }

    if (activeNote?.id === savedNote.id) {
      setActiveNote?.(savedNote);
      setTitle?.(savedNote.title);
    }
  } catch {
    toast.error("Failed to rename note");
  }
}

export async function createNewNote(
  uuid: string,
  router: AppRouterInstance,
  notes?: Note[],
  setNotes?: React.Dispatch<React.SetStateAction<Note[]>>,
  setActiveNote?: React.Dispatch<React.SetStateAction<Note | null>>,
  setTitle?: React.Dispatch<React.SetStateAction<string>>,
  editorRef?: React.RefObject<HTMLDivElement | null>,
  setIsDirty?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const newNote: Note = {
    id: nanoid(),
    title: "Untitled Note",
    content: "",
  };

  if (notes && setNotes) {
    setNotes((prev) => sortByTitle([...prev, newNote]));
  }

  setActiveNote?.(newNote);
  setTitle?.(newNote.title);
  if (editorRef?.current) editorRef.current.innerHTML = "";
  setIsDirty?.(false);
  router?.push(`/${uuid}/notes/${newNote.id}`);
  try {
    await saveNoteToDb(newNote, uuid);
  } catch (err) {
    toast.error("Failed to create note");
    console.error("Failed to create note in DB:", err);
  }
}

export async function selectNote(
  note: Note,
  uuid: string,
  router: AppRouterInstance,
  activeNote?: Note | null,
  isDirty?: boolean,
  title?: string,
  editorRef?: React.RefObject<HTMLDivElement | null>,
  setActiveNote?: React.Dispatch<React.SetStateAction<Note | null>>,
  setTitle?: React.Dispatch<React.SetStateAction<string>>,
  setNotes?: React.Dispatch<React.SetStateAction<Note[]>>,
) {
  if (note.id === activeNote?.id) return;

  if (isDirty && activeNote) {
    const updatedNote: Note = {
      ...activeNote,
      title: title?.trim() || "Untitled Note",
      content: editorRef?.current?.innerHTML ?? activeNote.content,
    };
    try {
      const savedNote = await saveNoteToDb(updatedNote, uuid);
      if (savedNote)
        setNotes?.((prev) =>
          prev.map((n) => (n.id === savedNote.id ? savedNote : n)),
        );
    } catch {
      toast.error("Failed to save before switching note:");
    }
  }

  // Temporarily clear activeNote so editor disappears
  setActiveNote?.(null);
  setTitle?.("");

  router.push(`/${uuid}/notes/${note.id}`);
}

//endregion
//region Folder Actions
export function sortFoldersRecursively(folders: Folder[]): Folder[] {
  return folders.map((folder) => ({
    ...folder,
    notes: sortByTitle((folder.notes ?? []).slice()),
    folders: sortFoldersRecursively(folder.folders ?? []),
  }));
}

export async function duplicateFolder(
  folder: Folder,
  uuid: string,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
): Promise<void> {
  async function duplicateFolderRecursively(
    f: Folder,
    parentId?: string,
  ): Promise<Folder> {
    const newFolder: Omit<Folder, "id"> = {
      title: f.title + " (Copy)",
      studentId: f.studentId,
      notes: [],
      folders: [],
      parentId,
    };
    const savedFolder = await saveFolderToDb(newFolder, uuid);
    const savedNotes: Note[] = [];
    for (const note of f.notes ?? []) {
      const newNote: Note = {
        ...note,
        id: nanoid(),
        folderId: savedFolder.id,
      };
      try {
        const savedNote = await saveNoteToDb(newNote, uuid);
        savedNotes.push(savedNote);
      } catch (error) {
        console.error("Failed to duplicate note in flashcards: ", error);
      }
    }
    const savedFolders: Folder[] = [];
    for (const folder of f.folders ?? []) {
      const newSubFolder = await duplicateFolderRecursively(
        folder,
        savedFolder.id,
      );
      savedFolders.push(newSubFolder);
    }

    return { ...savedFolder, notes: savedNotes, folders: savedFolders };
  }

  try {
    const duplicated = await duplicateFolderRecursively(
      folder,
      folder.parentId ?? undefined,
    );

    if (duplicated.parentId) {
      setFolders((prevFolders) => {
        const updateFolders = (folders: Folder[]): Folder[] =>
          folders.map((f) => {
            if (f.id === duplicated.parentId) {
              return {
                ...f,
                folders: sortByTitle([...(f.folders ?? []), duplicated]),
              };
            }
            return {
              ...f,
              folders: updateFolders(f.folders ?? []),
            };
          });

        return updateFolders(prevFolders);
      });
    } else {
      setFolders((prev) => sortByTitle([...prev, duplicated]));
    }
  } catch {
    toast.error("Failed to duplicate flashcards");
  }
}

export function collectAllFolders(folders: Folder[]): Folder[] {
  const result: Folder[] = [];
  traverseFolders(folders, (folder) => {
    result.push(folder);
  });

  return sortByTitle(result);
}

export function moveFolder(
  folderId: string,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
  folders: Folder[],
  uuid: string,
  parentId?: string,
) {
  const allFolders = collectAllFolders(folders);
  const oldFolder = allFolders.find((f) => f.id === folderId);
  if (!oldFolder) return;

  const childrenFolders = collectAllFolders([oldFolder]);
  const childrenFolderIds = childrenFolders.map((f) => f.id);
  if (parentId && childrenFolderIds.includes(parentId)) {
    // Prevent moving a flashcards into one of its own subfolders
    return;
  }

  const updatedFolder: Folder = { ...oldFolder, parentId };
  try {
    saveFolderToDb(updatedFolder, uuid);
  } catch (err) {
    toast.error("Failed to move flashcards");
    console.error("Failed to move flashcards in DB:", err);
    return;
  }

  setFolders((prevFolders) => {
    const removeFolder = (folders: Folder[]): Folder[] =>
      folders
        .filter((f) => f.id !== folderId)
        .map((f) => ({
          ...f,
          folders: removeFolder(f.folders ?? []),
        }));

    const cleaned = removeFolder(prevFolders);

    if (!parentId) {
      // Moving to root
      return sortByTitle([...cleaned, updatedFolder]);
    }

    // Moving inside another flashcards
    const addToParent = (folders: Folder[]): Folder[] =>
      folders.map((f) =>
        f.id === parentId
          ? {
              ...f,
              folders: sortByTitle([...(f.folders ?? []), updatedFolder]),
            }
          : { ...f, folders: addToParent(f.folders ?? []) },
      );

    return addToParent(cleaned);
  });
}

export async function renameFolder(
  folder: Folder,
  newTitle: string,
  uuid: string,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
) {
  try {
    const saved = await saveFolderToDb(
      { ...folder, title: newTitle.trim() || "Untitled Folder" },
      uuid,
    );

    setFolders((prev) =>
      mapFolders(prev, (f) =>
        f.id === saved.id
          ? { ...saved, folders: f.folders, notes: f.notes }
          : f,
      ),
    );
  } catch {
    toast.error("Failed to rename flashcards");
  }
}

export async function createNewFolder(
  uuid: string,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
) {
  const folderInput: FolderInput = { title: "Untitled Folder" };
  try {
    const savedFolder = await saveFolderToDb(folderInput, uuid);
    setFolders((prev) => sortFoldersRecursively([...prev, savedFolder]));
  } catch (err) {
    toast.error("Failed to create flashcards");
    console.error("Failed to create flashcards:", err);
  }
}

export async function handleImport(
  files: FileList,
  studentId: string,
  router: AppRouterInstance,
) {
  const importPromise = (async () => {
    const { rootFolderName, tree } = await processFilesIntoTree(files);
    const response = await fetch("/api/user/import-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        tree,
        rootFolderName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save to database");
    }

    router.refresh();
  })();

  toast.promise(importPromise, {
    loading: "Processing your vault...",
    success: "Import complete!",
    error: (err) => `Import failed: ${err.message}`,
  });
}

export async function processFilesIntoTree(files: FileList) {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) return { rootFolderName: "", tree: [] };

  const rootFolderName = fileArray[0].webkitRelativePath.split("/")[0];

  // We force a single root object to ensure the API always has a "tree" to loop through
  const mainRoot: ImportFolder = {
    title: rootFolderName,
    folders: [],
    notes: [],
  };

  for (const file of fileArray) {
    if (!file.name.endsWith(".md")) continue;

    const pathSegments = file.webkitRelativePath.split("/");
    pathSegments.shift(); // Remove the top-level "MyVault" name

    const fileName = pathSegments.pop()?.replace(".md", "") || "Untitled";
    const content = await file.text();

    const newNote = {
      title: fileName,
      content: content,
      lastEdited: Date.now(),
    };

    // If no segments left, the note is in the vault root
    if (pathSegments.length === 0) {
      mainRoot.notes.push(newNote);
      continue;
    }

    // Traverse the subfolders
    let currentLevel = mainRoot.folders;
    let targetFolder: ImportFolder | null = null;

    for (const segment of pathSegments) {
      let folder = currentLevel.find((f) => f.title === segment);
      if (!folder) {
        folder = { title: segment, folders: [], notes: [] };
        currentLevel.push(folder);
      }
      targetFolder = folder;
      currentLevel = folder.folders;
    }

    if (targetFolder) targetFolder.notes.push(newNote);
  }

  // We return mainRoot as the ONLY item in the tree.
  // This guarantees the API sees 1 flashcards and starts recursing.
  return { rootFolderName: "", tree: [mainRoot] };
}

export function deleteFolderFromFolders(
  folderId: string,
  folders: Folder[],
  activeNote?: Note | null,
  setActiveNote?: React.Dispatch<React.SetStateAction<Note | null>>,
  setTitle?: React.Dispatch<React.SetStateAction<string>>,
  editorRef?: React.RefObject<HTMLDivElement | null>,
  router?: AppRouterInstance,
  uuid?: string,
): Folder[] {
  return folders
    .filter((f) => f.id !== folderId)
    .map((f) => ({
      ...f,
      folders: deleteFolderFromFolders(
        folderId,
        f.folders ?? [],
        activeNote,
        setActiveNote,
        setTitle,
        editorRef,
        router,
        uuid,
      ),
    }));
}

function isNoteInFolderTree(noteId: string, folder: Folder): boolean {
  // Check notes in the current flashcards
  if ((folder.notes ?? []).some((n) => n.id === noteId)) {
    return true;
  }

  // Check notes in child folders recursively
  for (const childFolder of folder.folders ?? []) {
    if (isNoteInFolderTree(noteId, childFolder)) {
      return true;
    }
  }

  return false;
}

export async function deleteFolder(
  folderId: string,
  folders: Folder[],
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
  activeNote?: Note | null,
  setActiveNote?: React.Dispatch<React.SetStateAction<Note | null>>,
  setTitle?: React.Dispatch<React.SetStateAction<string>>,
  editorRef?: React.RefObject<HTMLDivElement | null>,
  router?: AppRouterInstance,
  uuid?: string,
) {
  try {
    await deleteFolderFromDb(folderId);
  } catch (err) {
    toast.error("Failed to delete flashcards");
    console.error("Failed to delete flashcards from DB:", err);
    return;
  }
  const folderToDelete = collectAllFolders(folders).find(
    (f) => f.id === folderId,
  );

  setFolders((prev) => deleteFolderFromFolders(folderId, prev));
  if (
    activeNote &&
    folderToDelete &&
    isNoteInFolderTree(activeNote.id, folderToDelete)
  ) {
    setActiveNote?.(null);
    setTitle?.("");
    if (editorRef?.current) editorRef.current.innerHTML = "";
    router?.push(`/${uuid}/notes`);
  }
}

export function findFolderPath(folders: Folder[], noteId: string): string[] {
  for (const folder of folders) {
    // Check direct children safely
    if ((folder.notes ?? []).some((n) => n.id === noteId)) {
      return [folder.id];
    }

    // Check nested folders safely
    if (folder.folders && folder.folders.length > 0) {
      const path = findFolderPath(folder.folders, noteId);
      if (path.length > 0) {
        return [folder.id, ...path];
      }
    }
  }
  return [];
}

export function findFolderPathByFolderId(
  folders: Folder[],
  folderId: string,
): string[] {
  for (const folder of folders) {
    if (folder.id === folderId) {
      return [folder.id];
    }

    if (folder.folders && folder.folders.length > 0) {
      const path = findFolderPathByFolderId(folder.folders, folderId);
      if (path.length > 0) {
        return [folder.id, ...path];
      }
    }
  }
  return [];
}

export function flattenFolders(folders: Folder[]): Folder[] {
  const result: Folder[] = [];

  function walk(folders: Folder[]) {
    for (const folder of folders) {
      result.push(folder);

      if (folder.folders && folder.folders.length > 0) {
        walk(folder.folders);
      }
    }
  }

  walk(folders);
  return result;
}

export function findNoteInFolders(
  folders: Folder[],
  noteId: string,
): Note | undefined {
  let found: Note | undefined;
  traverseFolders(folders, (folder) => {
    if (!found) {
      found = folder.notes?.find((n) => n.id === noteId);
    }
  });
  return found;
}

export function findFolderInFolders(
  folders: Folder[],
  folderId: string,
): Folder | undefined {
  let found: Folder | undefined;
  traverseFolders(folders, (folder) => {
    if (!found && folder.id === folderId) {
      found = folder;
    }
  });
  return found;
}

//endregion
//endregion

//region Helper functions
export function traverseFolders(
  folders: Folder[],
  visit: (folder: Folder) => void,
) {
  for (const folder of folders) {
    visit(folder);
    if (folder.folders?.length) {
      traverseFolders(folder.folders, visit);
    }
  }
}

export function mapFolders(
  folders: Folder[],
  mapper: (folder: Folder) => Folder,
): Folder[] {
  return folders.map((folder) => {
    const mapped = mapper(folder);
    return {
      ...mapped,
      folders: folder.folders
        ? mapFolders(folder.folders, mapper)
        : folder.folders,
    };
  });
}

export function sortByTitle<T extends { title: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => a.title.localeCompare(b.title));
}
//endregion
