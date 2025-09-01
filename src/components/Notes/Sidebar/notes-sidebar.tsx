import NotesEmptyState from "@/components/Notes/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Note } from "@/types";
import NoteItem from "./note-item";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import React from "react";
import {useParams} from "next/navigation";
import {saveNoteOrderToDb} from "@/lib/note-storage";


interface NotesSidebarProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  createNewNote?: () => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onRenameNote: (note: Note, newTitle: string) => void;
  activeNoteId?: string;
  loading?: boolean; // true while notes are loading
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
}

export function NotesSidebar({
  notes,
  onSelectNote,
  createNewNote,
  onDeleteNote,
  onDuplicateNote,
  onRenameNote,
  activeNoteId,
  loading = false,
  setNotes,
}: NotesSidebarProps) {
  const { uuid } = useParams() as { uuid: string };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const reordered = Array.from(notes);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setNotes(reordered);

    // Example: save to DB
    await saveNoteOrderToDb(uuid, reordered.map((n, i) => ({ id: n.id, order: i })));
  };

  return (
    <aside className="h-screen fixed right-0 top-0 z-40 border-l bg-card transition-all duration-300 ease-in-out w-80">
      <div className="justify-center flex p-5">
        <Button onClick={createNewNote} className="aspect-square" variant="ghost">
          <SquarePen/>
        </Button>
      </div>

      {loading ? (
        <ScrollArea className="h-full pr-5 pl-5">
          {/* Skeleton loaders */}
          <div className="flex flex-col gap-2 w-full">
            {Array.from({length: 8}).map((_, i) => (
              <div
                key={i}
                className="w-full p-3 rounded-md bg-popover animate-pulse flex items-center"
              >
                <Skeleton className="h-6 w-full rounded-md bg-popover"/>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : notes.length === 0 ? (
        <NotesEmptyState
          message="No notes yet"
          buttonText="Create your first note"
          onButtonClick={createNewNote}
        />
      ) : (
        <ScrollArea className="h-full pr-5 pl-5">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="notes-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-col gap-2 w-full"
                >
                  {notes.map((note, index) => (
                    <Draggable key={note.id} draggableId={note.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`rounded-md transition-colors ${
                            snapshot.isDragging ? "bg-accent" : ""
                          }`}
                        >
                          <NoteItem
                            note={note}
                            onSelectNote={onSelectNote}
                            onRenameNote={onRenameNote}
                            onDeleteNote={onDeleteNote}
                            onDuplicateNote={onDuplicateNote}
                            activeNoteId={activeNoteId}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ScrollArea>
      )}
    </aside>
  );
}
