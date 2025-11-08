"use client";

import { Folder, Note } from "@/lib/types";
import { useEffect, useState, use } from "react";
import NotesEmptyState from "@/components/Notes/empty-state";
import { loadNotes, saveNoteToDb, loadFolders } from "@/lib/note-storage";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createNewFolder,
  createNewNote,
  deleteNote,
  duplicateFolder,
  duplicateNote,
  moveFolder,
  moveNote,
  renameFolder,
  renameNote,
  renameNoteInFolders,
  selectNote,
} from "@/lib/notes/note-and-folder-actions";

interface PageProps {
  params: Promise<{ uuid: string }>;
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
    document.body.style.cursor = "default";
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingNotes(true);
      const loadedNotes = await loadNotes(uuid);
      const loadedFolders = await loadFolders(uuid);
      setNotes(loadedNotes);
      setFolders(loadedFolders);
      setLoadingNotes(false);
    })();
  }, [uuid]);

  const onDuplicateNote = async (note: Note) => {
    await duplicateNote(note, uuid, setFolders, setNotes);
  };

  const onDuplicateFolder = async (folder: Folder): Promise<void> => {
    await duplicateFolder(folder, uuid, setFolders);
  };

  const onSelectNote = async (note: Note) => {
    await selectNote(note, uuid, router);
  };

  const onRenameNote = async (note: Note, newTitle: string) => {
    await renameNote(note, newTitle, uuid, setNotes, setFolders);
  };

  const onCreateNewNote = async () => {
    await createNewNote(uuid, router);
  };

  const onCreateNewFolder = async () => {
    await createNewFolder(uuid, setFolders);
  };

  const onDeleteNote = async (id: string) => {
    await deleteNote(id, notes, setNotes, setFolders);
  };

  const moveNoteToFolder = (noteId: string, folderId?: string) => {
    moveNote(setNotes, setFolders, folders, noteId, uuid, folderId);
  };

  const moveFolderToFolder = (folderId: string, parentId?: string) => {
    moveFolder(folderId, setFolders, folders, uuid, parentId);
  };

  const onRenameFolder = async (folder: Folder, newTitle: string) => {
    await renameFolder(folder, newTitle, uuid, setFolders);
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen">
      <NotesSidebar
        moveNoteToFolder={moveNoteToFolder}
        moveFolderToFolder={moveFolderToFolder}
        notes={notes}
        folders={folders}
        onSelectNote={onSelectNote}
        createNewNote={onCreateNewNote}
        createNewFolder={onCreateNewFolder}
        onDeleteNote={onDeleteNote}
        onDuplicateNote={onDuplicateNote}
        onDuplicateFolder={onDuplicateFolder}
        onRenameNote={onRenameNote}
        onRenameFolder={onRenameFolder}
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
