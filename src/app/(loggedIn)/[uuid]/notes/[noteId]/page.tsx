"use client";

import { useNotes } from "@/hooks/use-notes";
import { Note, Folder } from "@/lib/types";
import { useEffect, useState, useRef, use } from "react";
import { loadNotes, saveNoteToDb, loadFolders } from "@/lib/note-storage";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import NotesEditor from "@/components/Notes/notes-editor";
import { useRouter, usePathname } from "next/navigation";
import {
  collectAllNotes,
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
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const noteIdFromPath = pathSegments[3]; // /uuid/notes/noteId
  const { uuid } = use(params);

  const {
    notes,
    folders,
    loading,
    onCreateNewNote,
    onCreateNewFolder,
    onDuplicateNote,
    onDuplicateFolder,
    onDeleteNote,
    onRenameNote,
    onRenameFolder,
    moveNoteToFolder,
    moveFolderToFolder,
    onSelectNote,
    activeNote,
    title,
    setTitle,
    setIsDirty,
    editorRef,
  } = useNotes(uuid, router, noteIdFromPath);


  return (
    <div className="flex min-h-screen">
      <NotesSidebar
        moveNoteToFolder={moveNoteToFolder}
        moveFolderToFolder={moveFolderToFolder}
        onDuplicateFolder={onDuplicateFolder}
        notes={notes}
        createNewFolder={onCreateNewFolder}
        onSelectNote={onSelectNote}
        createNewNote={onCreateNewNote}
        onDuplicateNote={onDuplicateNote}
        onDeleteNote={onDeleteNote}
        onRenameNote={onRenameNote}
        onRenameFolder={onRenameFolder}
        activeNoteId={activeNote?.id}
        loading={loading}
        folders={folders}
      />

      <div className="flex-1 h-screen">
        <div className="flex-1 h-screen">
          {loading ? (
            <NotesEditor
              note={{
                id: "",
                title: "",
                content: "",
                createdAt: Date.now(),
              }}
              title=""
              setTitle={() => {}}
              editorRef={editorRef}
              loading={true}
            />
          ) : activeNote ? (
            <NotesEditor
              note={activeNote}
              title={title}
              setTitle={setTitle}
              editorRef={editorRef}
              onDirtyChange={setIsDirty}
              loading={false}
            />
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
