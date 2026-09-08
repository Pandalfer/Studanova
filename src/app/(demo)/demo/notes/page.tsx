"use client";

import NotesEmptyState from "@/components/Notes/empty-state";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import NotesEditor from "@/components/Notes/notes-editor";
import { useDemoNotes } from "@/hooks/use-demo-notes";
import { formatRelativeDate } from "@/lib/notes/note-storage";

export default function DemoNotesPage() {
  const {
    notes,
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
    renameFolder,
    duplicateFolder,
    deleteFolder,
    moveFolderToFolder,
  } = useDemoNotes();

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen">
      <NotesSidebar
        moveNoteToFolder={moveNoteToFolder}
        moveFolderToFolder={moveFolderToFolder}
        onDuplicateNote={duplicateNote}
        onDuplicateFolder={duplicateFolder}
        folders={folders.filter((f) => !f.parentId)}
        createNewFolder={createNewFolder}
        notes={notes.filter((n) => !n.folderId)}
        onRenameNote={renameNote}
        onRenameFolder={(folder, newTitle) => renameFolder(folder.id, newTitle)}
        onSelectNote={selectNote}
        createNewNote={createNewNote}
        onDeleteNote={deleteNote}
        onDeleteFolder={deleteFolder}
        activeNoteId={activeNote?.id}
        isDemo={true}
      />
      <div className="flex-1 h-screen">
        {activeNote ? (
          <div className="relative h-full flex-1">
            <div className="absolute top-5 right-5 text-sm text-muted-foreground z-10">
              {activeNote?.lastEdited
                ? "Last Edited " + formatRelativeDate(activeNote.lastEdited)
                : ""}
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
          <NotesEmptyState message="Select or create a note to get started" />
        )}
      </div>
    </div>
  );
}
