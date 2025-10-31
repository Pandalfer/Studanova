"use client";

import NotesEmptyState from "@/components/Notes/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Folder as FolderIcon,
  FolderPen,
  NotepadText,
  SquarePen,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder, Note } from "@/lib/types";
import NoteItem from "./note-item";
import FolderItem from "@/components/Notes/Sidebar/folder-item";
import React from "react";
import { useMediaQuery } from "usehooks-ts";
import { DndContext, DragOverlay, useDroppable } from "@dnd-kit/core";
import {
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type MouseSensorOptions,
} from "@dnd-kit/core";
import type { MouseEvent as ReactMouseEvent } from "react";

interface NotesSidebarProps {
  notes: Note[];
  folders: Folder[];
  onSelectNote: (note: Note) => void;
  createNewNote?: () => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onDuplicateFolder: (folder: Folder) => void;
  onRenameNote: (note: Note, newTitle: string) => void;
  activeNoteId?: string;
  loading?: boolean;
  createNewFolder: () => void;
  moveNoteToFolder: (noteId: string, folderId?: string) => void;
  moveFolderToFolder: (folderId: string, parentId?: string) => void;
  activeId?: string | null; // for DragOverlay
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

function NotesSidebarContent({
  notes,
  folders,
  onSelectNote,
  createNewNote,
  onDeleteNote,
  onDuplicateNote,
  onDuplicateFolder,
  onRenameNote,
  activeNoteId,
  loading = false,
  createNewFolder,
}: NotesSidebarProps) {
  const [openFolders, setOpenFolders] = React.useState<string[]>([]);
  const isDesktop = useMediaQuery("(min-width: 640px)", {
    initializeWithValue: false,
  });

  const { setNodeRef: setRootNodeRef, isOver: isRootOver } = useDroppable({
    id: "root",
    data: { type: "folder" },
  });

  const firstRender = React.useRef(true);

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

  return (
    <>
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
          className={`pl-5 ${
            isDesktop ? "pr-5" : ""
          } flex flex-col h-[calc(100%-5rem)]`}
        >
          <div className="min-h-full flex flex-col">
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
                    onDuplicateFolder={onDuplicateFolder}
                    activeNoteId={activeNoteId}
                  />
                </div>
              ))}
            </div>

            <div
              ref={setRootNodeRef}
              className={`rounded-md transition-colors w-full flex-2 flex flex-col mt-2 mb-2 ${
                isRootOver ? "bg-primary/30" : ""
              }`}
            >
              <div className="flex flex-col gap-2 flex-1">
                {notes.map((note) => (
                  <NoteItem
                    key={note.id}
                    {...{
                      note,
                      onSelectNote,
                      onRenameNote,
                      onDeleteNote,
                      onDuplicateNote,
                      activeNoteId,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
    </>
  );
}

export function NotesSidebar(props: NotesSidebarProps) {
  class LeftClickMouseSensor extends MouseSensor {
    static activators = [
      {
        eventName: "onMouseDown" as const,
        handler: (
          { nativeEvent }: ReactMouseEvent<Element>,
          { onActivation }: MouseSensorOptions,
        ) => {
          if (nativeEvent.button === 0) {
            onActivation?.({ event: nativeEvent });
            return true;
          }
          return false;
        },
      },
    ];
  }

  const mouseSensor = useSensor(LeftClickMouseSensor, {
    activationConstraint: { distance: 5 },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { distance: 5 },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const [activeId, setActiveId] = React.useState<string | null>(null);

  function findNoteInFolders(
    folders: Folder[],
    noteId: string,
  ): Note | undefined {
    for (const folder of folders) {
      const note = folder.notes?.find((n) => n.id === noteId);
      if (note) return note;

      if (folder.folders) {
        const found = findNoteInFolders(folder.folders, noteId);
        if (found) return found;
      }
    }
    return undefined;
  }

  function findFolderInFolders(
    folders: Folder[],
    folderId: string,
  ): Folder | undefined {
    for (const Folder of folders) {
      const folder = Folder.folders?.find((n) => n.id === folderId);
      if (folder) return folder;

      if (Folder.folders) {
        const found = findFolderInFolders(Folder.folders, folderId);
        if (found) return found;
      }
    }
    return undefined;
  }

  const activeNote =
    props.notes.find((n) => n.id === activeId) ??
    findNoteInFolders(props.folders, activeId ?? "");
  const activeFolder =
    props.folders.find((f) => f.id === activeId) ??
    findFolderInFolders(props.folders, activeId ?? "");

  return (
    <aside className="h-screen fixed right-0 top-0 z-40 border-l bg-card transition-all duration-300 ease-in-out w-80">
      <DndContext
        sensors={sensors}
        onDragStart={({ active }) => setActiveId(active.id as string)}
        onDragEnd={({ active, over }) => {
          setActiveId(null);
          if (!over) return;

          if (over.data?.current?.type !== "folder") return;

          if (active.id === over.id) return; // no-op if dropped on itself

          active.data?.current?.type === "note"
            ? props.moveNoteToFolder(
                active.id as string,
                over.id == "root" ? undefined : (over.id as string),
              )
            : props.moveFolderToFolder(
                activeId as string,
                over.id === "root" ? undefined : (over.id as string),
              );
        }}
        onDragCancel={() => setActiveId(null)}
      >
        <NotesSidebarContent {...props} activeId={activeId} />
        <DragOverlay>
          {activeNote ? (
            <div className="p-3 rounded-md bg-popover shadow-lg flex flex-row">
              <NotepadText className={"pr-2"} />
              <p className={"truncate font-bold "}>{activeNote.title}</p>
            </div>
          ) : null}
          {activeFolder ? (
            <div className="p-3 rounded-md bg-popover shadow-lg flex flex-row">
              <FolderIcon className={"pr-2"} />
              <p className={"truncate font-bold "}>{activeFolder.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </aside>
  );
}
