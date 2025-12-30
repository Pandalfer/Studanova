"use client";

import { useNotes } from "@/hooks/use-notes";
import {act, use, useEffect} from "react";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import NotesEditor from "@/components/Notes/notes-editor";
import { useRouter, usePathname } from "next/navigation";
import { formatRelativeDate, loadFolders, loadNotes} from "@/lib/notes/note-storage";
import {useIsDesktop} from "@/lib/utils";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default function NotesPage({ params }: PageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const noteIdFromPath = pathSegments[3]; // /uuid/notes/noteId
  const { uuid } = use(params);
  const isDesktop = useIsDesktop();

  const {
    notes,
    folders,
    loading,
    onCreateNewNote,
    onCreateNewFolder,
    onDuplicateNote,
    onDuplicateFolder,
    onDeleteNote,
    onDeleteFolder,
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
        onDeleteFolder={onDeleteFolder}
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
              }}
              title=""
              setTitle={() => {}}
              editorRef={editorRef}
              loading={true}
            />
          ) : activeNote ? (
            <div className="relative h-full flex-1">
              <div className="absolute top-5 right-5 text-sm text-muted-foreground z-10">
                {activeNote?.lastEdited ? "Last Edited " + formatRelativeDate(activeNote.lastEdited) : ""}
              </div>

              <NotesEditor
                note={activeNote}
                title={title}
                setTitle={setTitle}
                editorRef={editorRef}
                onDirtyChange={setIsDirty}
                loading={false}
              />
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
