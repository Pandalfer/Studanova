"use client";

import NotesEmptyState from "@/components/Notes/empty-state";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import NotesEditor from "@/components/Notes/notes-editor";
import { useDemoNotes } from "@/hooks/use-demo-notes";

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
          <NotesEditor
            note={activeNote}
            title={title}
            setTitle={setTitle}
            editorRef={editorRef}
            onDirtyChange={setIsDirty}
          />
        ) : (
          <NotesEmptyState message="Select or create a note to get started" />
        )}
      </div>
    </div>
  );
}
