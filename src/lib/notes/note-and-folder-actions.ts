import { Folder, Note } from "@/lib/types";
import { saveFolderToDb, saveNoteToDb } from "@/lib/note-storage";
import React from "react";
import { nanoid } from "nanoid";

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
    result.push(...folder.notes);
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
  newNote.folderId
    ? setFolders((prevFolders) => {
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
      })
    : setNotes((prev) =>
        [...prev, newNote].sort((a, b) => a.title.localeCompare(b.title)),
      );
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

//endregion
