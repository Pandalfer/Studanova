"use client";

import { Folder, FolderInput, Note } from "@/lib/types";
import { useEffect, useState, use } from "react";
import NotesEmptyState from "@/components/Notes/empty-state";
import {
  loadNotes,
  saveNoteToDb,
  deleteNoteFromDb,
  loadFolders,
  saveFolderToDb,
} from "@/lib/note-storage";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

function collectAllNotes(folders: Folder[]): Note[] {
  const result: Note[] = [];
  for (const folder of folders) {
    result.push(...folder.notes);
    if (folder.folders && folder.folders.length > 0) {
      result.push(...collectAllNotes(folder.folders));
    }
  }
  return result;
}

function deleteNoteFromFolders(folders: Folder[], noteId: string): Folder[] {
  return folders.map((folder) => ({
    ...folder,
    notes: (folder.notes ?? []).filter((n) => n.id !== noteId),
    folders: deleteNoteFromFolders(folder.folders ?? [], noteId),
  }));
}

function renameNoteInFolders(folders: Folder[], updatedNote: Note): Folder[] {
  return folders.map((folder) => ({
    ...folder,
    notes: (folder.notes ?? [])
      .map((n) => (n.id === updatedNote.id ? updatedNote : n))
      .sort((a, b) => a.title.localeCompare(b.title)),
    folders: renameNoteInFolders(folder.folders ?? [], updatedNote),
  }));
}


function sortFoldersRecursively(folders: Folder[]): Folder[] {
  return folders.map((folder) => ({
    ...folder,
    notes: (folder.notes ?? []).slice().sort((a, b) =>
      a.title.localeCompare(b.title)
    ),
    folders: sortFoldersRecursively(folder.folders ?? []),
  }));
}

export default function NotesPage({ params }: PageProps) {
  const router = useRouter();
  const { uuid } = use(params);
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingNotes(true);
      const loadedNotes = await loadNotes(uuid);
      const loadedFolders = await loadFolders(uuid);
      setNotes(loadedNotes);
      setFolders(sortFoldersRecursively(loadedFolders));
      setLoadingNotes(false);
    })();
  }, [uuid]);

  const duplicateNote = async (note: Note) => {
    const newNote: Note = {
      id: nanoid(),
      title: note.title + " (Copy)",
      content: note.content,
      createdAt: Date.now(),
    };

    setNotes((prev) =>
      [...prev, newNote].sort((a, b) => a.title.localeCompare(b.title))
    );
    setFolders((prev) => sortFoldersRecursively(prev));
    saveNoteToDb(newNote, uuid).catch(console.error);
  };

  const selectNote = async (note: Note) => {
    router.push(`/${uuid}/notes/${note.id}`);
  };

  const renameNote = async (note: Note, newTitle: string) => {
    const updatedNote: Note = {
      ...note,
      title: newTitle.trim() || "Untitled Note",
    };
    try {
      const savedNote = await saveNoteToDb(updatedNote, uuid);
      if (savedNote) {
        if(!savedNote.folderId) {
          setNotes((prev) =>
            prev
              .map((n) => (n.id === savedNote.id ? savedNote : n))
              .sort((a, b) => a.title.localeCompare(b.title))
          );
        } else {
          setFolders((prev) => renameNoteInFolders(prev, savedNote));
        }
      }
      toast.success("Note renamed successfully");
    } catch {
      toast.error("Failed to rename note");
    }
  };

  const createNewNote = async () => {
    const newNote: Note = {
      id: nanoid(),
      title: "Untitled Note",
      content: "",
      createdAt: Date.now(),
    };

    // Save to DB first
    await saveNoteToDb(newNote, uuid);
    router.push(`/${uuid}/notes/${newNote.id}`);
  };

  const createNewFolder = async () => {
    const folderInput: FolderInput = { title: "Untitled Folder" };
    try {
      const savedFolder = await saveFolderToDb(folderInput, uuid);
      setFolders((prev) => sortFoldersRecursively([...prev, savedFolder]));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await deleteNoteFromDb(id);
    } catch (err) {
      console.error("Failed to delete note from DB:", err);
    }

    const noteToDelete = notes.find((n) => n.id === id);
    if(noteToDelete) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      return;
    }

    setFolders((prev) => deleteNoteFromFolders(prev, id));
  };

  const moveNoteToFolder = (noteId: string, folderId?: string) => {
    setNotes((prevNotes) => {
      // find the note in root
      let note = prevNotes.find((n) => n.id === noteId);

      // if not in root, look inside folders
      if (!note) {
        const all = collectAllNotes(folders);
        note = all.find((n) => n.id === noteId);
      }

      if (!note) return prevNotes;

      const updatedNote: Note = { ...note, folderId };

      // save to DB
      saveNoteToDb(updatedNote, uuid).catch(console.error);

      // if moved to a folder, remove it from root notes
      const nextNotes = folderId
        ? prevNotes.filter((n) => n.id !== noteId)
        : prevNotes.map((n) => (n.id === noteId ? updatedNote : n));

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
                notes: [...cleanedNotes, updatedNote].sort((a, b) => a.title.localeCompare(b.title)),
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
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen">
      <NotesSidebar
        moveNoteToFolder={moveNoteToFolder}
        notes={notes}
        folders={folders}
        onSelectNote={selectNote}
        createNewNote={createNewNote}
        createNewFolder={createNewFolder}
        onDeleteNote={deleteNote}
        onDuplicateNote={duplicateNote}
        onRenameNote={renameNote}
        loading={loadingNotes}
      />
      <div className="flex-1 h-screen">
        <NotesEmptyState
          message={"Select or create a new note to get started"}
        />
      </div>
    </div>
  );
}
