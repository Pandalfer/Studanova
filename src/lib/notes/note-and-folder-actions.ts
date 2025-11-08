import { Folder, FolderInput, Note } from "@/lib/types";
import {
  deleteNoteFromDb,
  saveFolderToDb,
  saveNoteToDb,
} from "@/lib/note-storage";
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
//region Note Actions
export function collectAllNotes(folders: Folder[]): Note[] {
  const result: Note[] = [];
  for (const folder of folders) {
    result.push(...(folder.notes ?? []));
    if (folder.folders && folder.folders.length > 0) {
      result.push(...collectAllNotes(folder.folders));
    }
  }
  return result.sort((a, b) => a.title.localeCompare(b.title));
}

export function deleteNoteFromFolders(
  folders: Folder[],
  noteId: string,
): Folder[] {
  return folders.map((folder) => ({
    ...folder,
    notes: (folder.notes ?? []).filter((n) => n.id !== noteId),
    folders: deleteNoteFromFolders(folder.folders ?? [], noteId),
  }));
}

export function renameNoteInFolders(
  folders: Folder[],
  updatedNote: Note,
): Folder[] {
  return folders.map((folder) => ({
    ...folder,
    notes: (folder.notes ?? [])
      .map((n) => (n.id === updatedNote.id ? updatedNote : n))
      .sort((a, b) => a.title.localeCompare(b.title)),
    folders: renameNoteInFolders(folder.folders ?? [], updatedNote),
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
    saveNoteToDb(updatedNote, uuid).catch(console.error);

    let nextNotes: Note[];

    if (folderId) {
      // Moving into a folder → remove from root
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
              notes: [...cleanedNotes, updatedNote].sort((a, b) =>
                a.title.localeCompare(b.title),
              ),
              folders: updateFolders(folder.folders ?? []),
            };
          }

          return {
            ...folder,
            notes: cleanedNotes.sort((a, b) => a.title.localeCompare(b.title)),
            folders: updateFolders(folder.folders ?? []),
          };
        });

      return updateFolders(prevFolders);
    });

    return nextNotes.sort((a, b) => a.title.localeCompare(b.title));
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
    createdAt: Date.now(),
    folderId: note.folderId ?? undefined,
  };

  saveNoteToDb(newNote, uuid).catch(console.error);
  if (newNote.folderId) {
    setFolders((prevFolders) => {
      const updateFolders = (folders: Folder[]): Folder[] =>
        folders.map((folder) => {
          if (folder.id === newNote.folderId) {
            return {
              ...folder,
              notes: [...folder.notes, newNote].sort((a, b) =>
                a.title.localeCompare(b.title),
              ),
              folders: updateFolders(folder.folders ?? []),
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
    setNotes((prev) =>
      [...prev, newNote].sort((a, b) => a.title.localeCompare(b.title)),
    );
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
        prev
          .map((n) => (n.id === savedNote.id ? savedNote : n))
          .sort((a, b) => a.title.localeCompare(b.title)),
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
  document.body.style.cursor = "wait";

  const newNote: Note = {
    id: nanoid(),
    title: "Untitled Note",
    content: "",
    createdAt: Date.now(),
  };

  if (notes && setNotes) {
    setNotes((prev) =>
      [...prev, newNote].sort((a, b) => a.title.localeCompare(b.title)),
    );
  }

  setActiveNote?.(newNote);
  setTitle?.(newNote.title);
  if (editorRef?.current) editorRef.current.innerHTML = "";
  setIsDirty?.(false);
  router?.push(`/${uuid}/notes/${newNote.id}`);
  saveNoteToDb(newNote, uuid).catch(console.error);
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
    } catch (err) {
      console.error("Failed to save before switching note:", err);
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
    notes: (folder.notes ?? [])
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title)),
    folders: sortFoldersRecursively(folder.folders ?? []),
  }));
}

export async function duplicateFolder(
  folder: Folder,
  uuid: string,
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>,
): Promise<void> {
  console.log(folder);
  const folderInput: Omit<Folder, "id"> = {
    title: folder.title + " (Copy)",
    notes: folder.notes ?? [],
    folders: folder.folders ?? [],
    parentId: folder.parentId ?? undefined,
    studentId: folder.studentId,
  };

  try {
    const newFolder = await saveFolderToDb(folderInput, uuid);
    if (newFolder.parentId) {
      setFolders((prevFolders) => {
        const updateFolders = (folders: Folder[]): Folder[] =>
          folders.map((f) => {
            if (f.id === newFolder.parentId) {
              return {
                ...f,
                folders: [...(f.folders ?? []), newFolder].sort((a, b) =>
                  a.title.localeCompare(b.title),
                ),
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
      setFolders((prev) =>
        [...prev, newFolder].sort((a, b) => a.title.localeCompare(b.title)),
      );
    }
  } catch {
    toast.error("Failed to duplicate folder");
  }
}

export function collectAllFolders(folders: Folder[]): Folder[] {
  const result: Folder[] = [];
  for (const folder of folders) {
    result.push(folder);
    if (folder.folders && folder.folders.length > 0) {
      result.push(...collectAllFolders(folder.folders));
    }
  }
  return result.sort((a, b) => a.title.localeCompare(b.title));
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
    // Prevent moving a folder into one of its own subfolders
    return;
  }

  const updatedFolder: Folder = { ...oldFolder, parentId };
  saveFolderToDb(updatedFolder, uuid).catch(console.error);

  setFolders((prevFolders) => {
    // Remove the folder from all levels
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
      return [...cleaned, updatedFolder].sort((a, b) =>
        a.title.localeCompare(b.title),
      );
    }

    // Moving inside another folder
    const addToParent = (folders: Folder[]): Folder[] =>
      folders.map((f) =>
        f.id === parentId
          ? {
              ...f,
              folders: [...(f.folders ?? []), updatedFolder].sort((a, b) =>
                a.title.localeCompare(b.title),
              ),
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
  const updatedFolder: Folder = {
    ...folder,
    title: newTitle.trim() || "Untitled Folder",
  };
  try {
    const savedFolder = await saveFolderToDb(updatedFolder, uuid);
    const folderWithContent = {
      ...savedFolder,
      folders: folder.folders,
      notes: folder.notes,
    };
    if (folderWithContent) {
      setFolders((prev) => {
        const updateFolders = (folders: Folder[]): Folder[] =>
          folders.map((f) => {
            if (f.id === folderWithContent.id) {
              return folderWithContent;
            }
            return {
              ...f,
              folders: updateFolders(f.folders ?? []),
            };
          });
        return updateFolders(prev);
      });
    }
  } catch {
    toast.error("Failed to rename folder");
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
    console.error(err);
  }
}

//endregion
