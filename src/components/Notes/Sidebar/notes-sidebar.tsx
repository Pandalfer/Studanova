import NotesEmptyState from "@/components/Notes/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FolderPen, SquarePen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder, Note } from "@/lib/types";
import NoteItem from "./note-item";
import FolderItem from "@/components/Notes/Sidebar/folder-item";
import React from "react";
import { useMediaQuery } from "usehooks-ts";
import {DndContext, DragOverlay, PointerSensor, useDroppable, useSensor} from "@dnd-kit/core";

interface NotesSidebarProps {
  notes: Note[];
  folders: Folder[];
  onSelectNote: (note: Note) => void;
  createNewNote?: () => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onRenameNote: (note: Note, newTitle: string) => void;
  activeNoteId?: string;
  loading?: boolean;
  createNewFolder: () => void;
  moveNoteToFolder: (noteId: string, folderId?: string) => void;
}

function findFolderPath(folders: Folder[], noteId: string): string[] {
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

export function NotesSidebar({
  notes,
  folders,
  onSelectNote,
  createNewNote,
  onDeleteNote,
  onDuplicateNote,
  onRenameNote,
  activeNoteId,
  loading = false,
  createNewFolder,
  moveNoteToFolder,
}: NotesSidebarProps) {
  const [openFolders, setOpenFolders] = React.useState<string[]>([]);
  const isDesktop = useMediaQuery("(min-width: 640px)", {
    initializeWithValue: false,
  });
  const { setNodeRef: setRootRef, isOver: isOverRoot } = useDroppable({ id: "root" });
  const firstRender = React.useRef(true);

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const activeNote =
    notes.find((n) => n.id === activeId) ??
    findNoteInFolders(folders, activeId ?? "");

  React.useEffect(() => {
    if (!activeNoteId) return;

    const path = findFolderPath(folders, activeNoteId);

    if (firstRender.current) {
      setOpenFolders(path);
      firstRender.current = false;
    } else {
      if (path.join("/") !== openFolders.join("/")) {
        setOpenFolders(path);
      }
    }
  }, [activeNoteId]);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  function findNoteInFolders(folders: Folder[], noteId: string): Note | undefined {
    for (const folder of folders) {
      const note = folder.notes?.find((n) => n.id === noteId);
      if (note) return note;

      if (folder.folders) {
        const found = findNoteInFolders(folder.folders, noteId);
        if (found) return found;
      }
    }
    return undefined; // instead of null
  }

  return (
    <aside className="h-screen fixed right-0 top-0 z-40 border-l bg-card transition-all duration-300 ease-in-out w-80">
      {/* Toolbar */}
      <div className="justify-center flex p-5">
        <Button
          onClick={createNewNote}
          className="aspect-square"
          variant="ghost"
        >
          <SquarePen />
        </Button>
        <Button
          onClick={createNewFolder}
          className="aspect-square"
          variant="ghost"
        >
          <FolderPen />
        </Button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <ScrollArea className="h-full pr-5 pl-5">
          <div className="flex flex-col gap-2 w-full">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="w-full p-3 rounded-md bg-popover animate-pulse flex items-center"
              >
                <Skeleton className="h-6 w-full rounded-md bg-popover" />
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : notes.length === 0 && folders.length === 0 ? (
        // Empty state
        <NotesEmptyState
          message="No notes yet"
          buttonText="Create your first note"
          onButtonClick={createNewNote}
        />
      ) : (
        // Folders + Notes
        <ScrollArea
          className={`pl-5 ${isDesktop ? "pr-5" : ""}`}
          style={{ height: "calc(100% - 5rem)" }}
        >
          <DndContext
            sensors={[pointerSensor]}
            onDragStart={({ active }) => setActiveId(active.id as string)}
            onDragEnd={({ active, over }) => {
              setActiveId(null);
              if (!over) return;

              let note = notes.find((n) => n.id === active.id);
              if (!note) {
                note = findNoteInFolders(folders, active.id as string);
              }
              if (!note) return;

              if (over.data?.current?.type !== "folder" && over.id !== "root") return;

              moveNoteToFolder(note.id, over.id === "root" ? undefined : (over.id as string));
            }}
            onDragCancel={() => setActiveId(null)}
          >
            <div className="flex flex-col gap-2 w-full min-w-0">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="rounded-md transition-colors min-w-0"
                >
                  <FolderItem
                    folder={folder}
                    openFolders={openFolders}
                    setOpenFolders={setOpenFolders}
                    onSelectNote={onSelectNote}
                    onRenameNote={onRenameNote}
                    onDeleteNote={onDeleteNote}
                    onDuplicateNote={onDuplicateNote}
                    activeNoteId={activeNoteId}
                  />
                </div>
              ))}
            </div>

            <div ref={setRootRef} className={`${isOverRoot ? "bg-primary/30" : ""} flex flex-col gap-2 w-full mt-2`}>
              {notes.map((note) => (
                <div key={note.id} className="rounded-md transition-colors">
                  <NoteItem
                    note={note}
                    onSelectNote={onSelectNote}
                    onRenameNote={onRenameNote}
                    onDeleteNote={onDeleteNote}
                    onDuplicateNote={onDuplicateNote}
                    activeNoteId={activeNoteId}
                  />
                </div>
              ))}
            </div>
            <DragOverlay>
              {activeNote ? (
                <div className="p-3 rounded-md bg-card shadow-lg">
                  {activeNote.title}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </ScrollArea>
      )}
    </aside>
  );
}
