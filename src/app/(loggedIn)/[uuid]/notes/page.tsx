"use client";

import { useNotes} from "@/hooks/use-notes";
import { use } from "react";
import NotesEmptyState from "@/components/Notes/empty-state";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default function NotesPage({ params }: PageProps) {
  const router = useRouter();
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
  } = useNotes(uuid, router);

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
        loading={loading}
      />
      <div className="flex-1 h-screen">
        <NotesEmptyState
          message={"Select or create a new note to get started"}
        />
      </div>
    </div>
  );
}
