"use client";

import { Folder, Note } from "@/lib/types";
import React, { useCallback, useMemo, useState } from "react";
import NoteItem from "@/components/Notes/Sidebar/note-item";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Copy, PencilLine } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

function FolderItem({
  folder,
  openFolders,
  setOpenFolders,
  onSelectNote,
  onRenameNote,
  onDeleteNote,
  onRenameFolder,
  onDuplicateNote,
  onDuplicateFolder,
  activeNoteId,
}: {
  folder: Folder;
  openFolders: string[];
  setOpenFolders: React.Dispatch<React.SetStateAction<string[]>>;
  onSelectNote: (note: Note) => void;
  onRenameNote: (note: Note, newTitle: string) => void;
  onRenameFolder: (folder: Folder, newTitle: string) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onDuplicateFolder: (folder: Folder) => void;
  activeNoteId?: string;
}) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(folder.title);

  const isClosestFolder = useMemo(
    () => folder.notes?.some((n) => n.id === activeNoteId) ?? false,
    [folder.notes, activeNoteId],
  );

  const collectDescendantFolderIds = useCallback((folder: Folder): string[] => {
    let ids: string[] = [];
    if (folder.folders) {
      for (const child of folder.folders) {
        ids.push(child.id);
        ids = ids.concat(collectDescendantFolderIds(child));
      }
    }
    return ids;
  }, []);

  const { setNodeRef, isOver } = useDroppable({
    id: folder.id,
    data: { type: "folder" },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
  } = useDraggable({
    id: folder.id,
    data: { type: "folder" },
  });

  const finishRename = () => {
    const trimmed = newTitle.trim();
    setRenameDialogOpen(false);

    if (!trimmed) {
      setNewTitle(folder.title); // revert if empty
      return;
    }

    if (trimmed !== folder.title) {
      onRenameFolder?.(folder, trimmed);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`rounded-md transition-colors ${isOver ? "bg-primary/30" : ""}`}
    >
      <div {...attributes} {...listeners} style={{}} ref={setDraggableNodeRef}>
        <Accordion
          type="multiple"
          value={openFolders}
          onValueChange={(newValue) => {
            if (
              openFolders.includes(folder.id) &&
              !newValue.includes(folder.id)
            ) {
              // folder is being closed
              const descendantIds = collectDescendantFolderIds(folder);
              setOpenFolders(
                newValue.filter((id) => !descendantIds.includes(id)),
              );
            } else {
              setOpenFolders(newValue);
            }
          }}
        >
          <AccordionItem value={folder.id}>
            <ContextMenu modal={false}>
              <ContextMenuTrigger>
                <AccordionTrigger
                  className={`h-12 min-w-60 w-full flex items-center ${isOver ? " " : "hover:bg-accent dark:hover:bg-accent"} truncate`}
                  arrow="left"
                >
                  <h3 className="text-sm font-medium leading-tight truncate w-full font-bold">
                    {folder.title.substring(0, 25)}
                    {folder.title.length > 25 ? "..." : ""}
                  </h3>
                </AccordionTrigger>
              </ContextMenuTrigger>
              <ContextMenuContent className={"w-48 rounded-md shadow-lg"}>
                <ContextMenuItem
                  onClick={() => {
                    onDuplicateFolder(folder);
                  }}
                >
                  <Copy /> Duplicate Folder
                </ContextMenuItem>
                <AlertDialog
                  open={renameDialogOpen}
                  onOpenChange={setRenameDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <ContextMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setRenameDialogOpen(true);
                        setTimeout(() => {
                          const input =
                            document.querySelector<HTMLInputElement>(
                              "#rename-input",
                            );
                          input?.focus();
                          input?.select();
                        });
                      }}
                    >
                      <PencilLine /> Rename
                    </ContextMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Rename Note</AlertDialogTitle>
                    </AlertDialogHeader>
                    <Input
                      id="rename-input"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") finishRename();
                        if (e.key === "Escape") {
                          setRenameDialogOpen(false);
                          setNewTitle(folder.title);
                        }
                      }}
                      autoFocus
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => {
                          setRenameDialogOpen(false);
                          setNewTitle(folder.title);
                        }}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={finishRename}>
                        Save
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </ContextMenuContent>
            </ContextMenu>

            <AccordionContent className="mt-2">
              <div
                className={`flex flex-col pl-4 border-l ${isClosestFolder ? "border-muted" : "border-border"}`}
              >
                {/* Nested Folders */}
                {folder.folders?.map((subfolder) => (
                  <div
                    key={subfolder.id}
                    className="rounded-md transition-colors"
                  >
                    <FolderItem
                      folder={subfolder}
                      openFolders={openFolders}
                      setOpenFolders={setOpenFolders}
                      onSelectNote={onSelectNote}
                      onRenameNote={onRenameNote}
                      onRenameFolder={onRenameFolder}
                      onDeleteNote={onDeleteNote}
                      onDuplicateNote={onDuplicateNote}
                      onDuplicateFolder={onDuplicateFolder}
                      activeNoteId={activeNoteId}
                    />
                  </div>
                ))}

                {/* Notes */}
                <SortableContext
                  items={folder.notes ?? []}
                  strategy={verticalListSortingStrategy}
                >
                  {folder.notes?.map((note) => (
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
                </SortableContext>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export default React.memo(FolderItem);
