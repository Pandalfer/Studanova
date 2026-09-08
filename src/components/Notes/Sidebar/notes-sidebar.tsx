"use client";

import NotesEmptyState from "@/components/Notes/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Folder as FolderIcon,
  FolderDown,
  FolderPen,
  NotepadText,
  Search,
  SquarePen,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder, Note } from "@/lib/types";
import NoteItem from "./note-item";
import FolderItem from "@/components/Notes/Sidebar/folder-item";
import React from "react";
import { DndContext, DragOverlay, useDroppable } from "@dnd-kit/core";
import {
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type MouseSensorOptions,
} from "@dnd-kit/core";
import type { MouseEvent as ReactMouseEvent } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  findFolderPath,
  findFolderPathByFolderId,
  findFolderInFolders,
  findNoteInFolders,
} from "@/lib/notes/note-and-folder-actions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsDesktop } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface NotesSidebarProps {
  notes: Note[];
  folders: Folder[];
  onSelectNote: (note: Note) => void;
  createNewNote?: () => void;
  onDeleteNote: (id: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onDuplicateNote: (note: Note) => void;
  onDuplicateFolder: (folder: Folder) => void;
  onRenameNote: (note: Note, newTitle: string) => void;
  onRenameFolder: (folder: Folder, newTitle: string) => void;
  activeNoteId?: string;
  loading?: boolean;
  createNewFolder: () => void;
  moveNoteToFolder: (noteId: string, folderId?: string) => void;
  moveFolderToFolder: (folderId: string, parentId?: string) => void;
  handleImport?: (files: FileList) => void;
  isDemo: boolean;
}

interface NotesSidebarContentProps extends NotesSidebarProps {
  activeId?: string | null;
  isDragLocked: boolean;
  setIsDragLocked: (locked: boolean) => void;
}

function NotesSidebarContent({
  notes,
  folders,
  onSelectNote,
  createNewNote,
  onDeleteNote,
  onDeleteFolder,
  onDuplicateNote,
  onDuplicateFolder,
  onRenameNote,
  onRenameFolder,
  activeNoteId,
  loading = false,
  createNewFolder,
  isDragLocked,
  setIsDragLocked,
  isDemo,
  handleImport,
}: NotesSidebarContentProps) {
  const [openFolders, setOpenFolders] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");
  const isSearching = searchQuery.trim().length > 0;
  const [matchingNotes, setMatchingNotes] = React.useState<Note[]>([]);
  const workerRef = React.useRef<Worker | null>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    workerRef.current = new Worker(
      new URL("@/lib/notes/notes-search-worker.ts", import.meta.url),
    );

    workerRef.current.onmessage = (event) => {
      setMatchingNotes(event.data);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  React.useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        searchQuery: debouncedSearchQuery,
        folders,
        notes,
      });
    }
  }, [debouncedSearchQuery, folders, notes]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isDesktop = useIsDesktop();

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

  React.useEffect(() => {
    if (!activeNoteId) return;

    const timeoutId = setTimeout(() => {
      const activeElement = document.querySelector(
        '[data-active-note="true"]',
      ) as HTMLElement | null;

      const viewport = scrollAreaRef.current?.querySelector(
        '[data-slot="scroll-area-viewport"]',
      );

      if (!activeElement || !viewport) return;

      const viewportRect = viewport.getBoundingClientRect();
      const elementRect = activeElement.getBoundingClientRect();

      const targetTop =
        viewport.scrollTop +
        (elementRect.top - viewportRect.top) -
        (viewportRect.height / 2 - elementRect.height / 2);
      const targetLeft =
        viewport.scrollLeft + (elementRect.left - viewportRect.left);

      const maxScrollTop = viewport.scrollHeight - viewportRect.height;
      const maxScrollLeft = viewport.scrollWidth - viewportRect.width;

      viewport.scrollTo({
        top: Math.max(0, Math.min(targetTop, maxScrollTop)),
        left: Math.max(0, Math.min(targetLeft, maxScrollLeft)),
        behavior: "smooth",
      });
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [activeNoteId]);

  const handleSelectFolder = (folder: Folder) => {
    const path = findFolderPathByFolderId(folders, folder.id);
    setOpenFolders(path);
    setSearchQuery("");
  };

  const handleSelectNote = (note: Note) => {
    const path = findFolderPath(folders, note.id);
    setOpenFolders(path);
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col h-full">
      {!isDragLocked && (
        <div className="bg-primary text-primary-foreground text-[10px] py-1 text-center font-bold uppercase tracking-widest">
          Drag Mode Active
        </div>
      )}
      <div className="justify-center flex p-5 pb-0 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild={true}>
            <Button
              onClick={createNewNote}
              className="aspect-square"
              variant="ghost"
            >
              <SquarePen />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Note</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild={true}>
            <Button
              onClick={createNewFolder}
              className="aspect-square"
              variant="ghost"
            >
              <FolderPen />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Folder</TooltipContent>
        </Tooltip>
        <Tooltip>
          <Dialog>
            {/* 1. TooltipTrigger must be the immediate parent of the button */}
            <TooltipTrigger asChild>
              {/* 2. DialogTrigger must also be asChild so they share the same button element */}
              <DialogTrigger asChild>
                <Button
                  className={`aspect-square ${isDemo ? "opacity-50" : ""}`}
                  variant="ghost"
                  onClick={(e) => {
                    if (isDemo) {
                      e.preventDefault();
                      e.stopPropagation();
                      toast.info(
                        "Sign in to upload notes from Obsidian or Notion.",
                      );
                    }
                  }}
                >
                  <FolderDown />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>

            <TooltipContent>
              {isDemo ? "Sign in to Import" : "Import Notes"}
            </TooltipContent>

            {/* 3. DialogContent stays inside the Dialog but outside the Trigger logic */}
            {!isDemo && (
              <DialogContent className="sm:max-w-md">
                <DialogTitle>Import Notes</DialogTitle>
                <div className="space-y-4">
                  <div
                    className="group relative flex flex-col items-center justify-center space-y-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                    onClick={() =>
                      document.getElementById("obsidian-import")?.click()
                    }
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted group-hover:bg-background transition-colors">
                      <FolderDown className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-medium">
                        Click or drag folder to upload
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Obsidian Vault or Notion Export
                      </p>
                    </div>

                    <Input
                      id="obsidian-import"
                      type="file"
                      className="hidden"
                      multiple
                      {...({
                        webkitdirectory: "true",
                        directory: "true",
                      } as React.HTMLAttributes<HTMLInputElement>)}
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          handleImport?.(files);
                        }
                      }}
                    />
                  </div>
                  <div className="rounded-md bg-blue-500/10 p-3 text-[12px] text-blue-600 dark:text-blue-400">
                    <strong>Tip:</strong> If you are using Notion, export as
                    Markdown & CSV first, then unzip and upload the folder here.
                  </div>
                </div>
              </DialogContent>
            )}
          </Dialog>
        </Tooltip>
      </div>

      {/* Search Bar */}
      <div className="justify-center flex p-5 shrink-0">
        <InputGroup className="!bg-card">
          <InputGroupInput
            placeholder="Search..."
            className="placeholder:text-muted"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSearchQuery("");
            }}
          />
          <InputGroupAddon>
            <Search className="!text-muted" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end" className={"text-muted"}>
            {isSearching ? `${matchingNotes.length} results` : null}
          </InputGroupAddon>
        </InputGroup>
      </div>

      {isSearching && (
        <div className="px-5 pb-2 text-sm text-muted font-bold">
          Best results
        </div>
      )}
      {/* Loading Skeleton */}
      {loading ? (
        <ScrollArea className="flex-1 pr-5 pl-5">
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
        <NotesEmptyState
          message="No notes yet"
          buttonText="Create your first note"
          onButtonClick={createNewNote}
        />
      ) : (
        <ScrollArea
          className={`pl-5 ${isDesktop ? "pr-5" : ""} 
          ${isSearching ? "h-[calc(100%-10.25rem)] " : "h-[calc(100%-8.5rem)] "}
          flex flex-col`}
          ref={scrollAreaRef}
        >
          <div className="min-h-full flex flex-col">
            {isSearching ? (
              <>
                {matchingNotes.map((note) => (
                  <NoteItem
                    key={note.id}
                    handleNoteSelect={handleSelectNote}
                    {...{
                      note,
                      onSelectNote,
                      onRenameNote,
                      onDeleteNote,
                      onDuplicateNote,
                      activeNoteId,
                      isDragLocked,
                      setIsDragLocked,
                    }}
                  />
                ))}
              </>
            ) : (
              <>
                <div className="flex flex-col w-full min-w-0">
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
                        onRenameFolder={onRenameFolder}
                        onDeleteNote={onDeleteNote}
                        onDeleteFolder={onDeleteFolder}
                        onDuplicateNote={onDuplicateNote}
                        onDuplicateFolder={onDuplicateFolder}
                        isDragLocked={isDragLocked}
                        setIsDragLocked={setIsDragLocked}
                        activeNoteId={activeNoteId}
                        onSelectFolder={handleSelectFolder}
                      />
                    </div>
                  ))}
                </div>

                <div
                  ref={setRootNodeRef}
                  className={`rounded-md transition-colors w-full flex-1 flex flex-col mb-2 ${
                    isRootOver ? "bg-primary/30" : ""
                  }`}
                >
                  <div className="flex flex-col flex-1">
                    {notes.map((note) => (
                      <NoteItem
                        isDragLocked={isDragLocked}
                        setIsDragLocked={setIsDragLocked}
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
              </>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export function NotesSidebar(props: NotesSidebarProps) {
  const [isDragLocked, setIsDragLocked] = React.useState(true);
  const isDesktop = useIsDesktop();

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
    activationConstraint: { distance: 10 },
    enable: true,
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
    enabled: isDesktop ? true : isDragLocked,
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const [activeId, setActiveId] = React.useState<string | null>(null);

  const activeNote =
    props.notes.find((n) => n.id === activeId) ??
    findNoteInFolders(props.folders, activeId ?? "");
  const activeFolder =
    props.folders.find((f) => f.id === activeId) ??
    findFolderInFolders(props.folders, activeId ?? "");

  const content = (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActiveId(active.id as string)}
      onDragEnd={({ active, over }) => {
        setActiveId(null);
        setIsDragLocked(true);
        if (!over) return;

        if (over.data?.current?.type !== "folder") return;

        if (active.id === over.id) return;

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
      onDragCancel={() => {
        setActiveId(null);
        setIsDragLocked(true);
      }}
    >
      <NotesSidebarContent
        {...props}
        activeId={activeId}
        isDragLocked={isDragLocked}
        setIsDragLocked={setIsDragLocked}
      />

      <DragOverlay>
        {activeNote && (
          <div className="p-3 rounded-md bg-popover shadow-lg flex flex-row">
            <NotepadText className={"pr-2"} />
            <p className={"truncate font-bold "}>{activeNote.title}</p>
          </div>
        )}
        {activeFolder && (
          <div className="p-3 rounded-md bg-popover shadow-lg flex flex-row">
            <FolderIcon className={"pr-2"} />
            <p className={"truncate font-bold "}>{activeFolder.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );

  if (isDesktop) {
    return (
      <aside className="h-screen fixed right-0 top-0 z-40 border-l bg-card transition-all duration-300 ease-in-out w-80">
        {content}
      </aside>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 bottom-4 z-50 rounded-full"
        >
          <NotepadText />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 w-80">
        <SheetHeader className="sr-only">
          <SheetTitle>Notes</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
