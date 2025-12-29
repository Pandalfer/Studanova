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
import { Copy, HandIcon, LockIcon, PencilLine, Trash2 } from "lucide-react";
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
import { useIsDesktop } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function FolderItem({
  folder,
  openFolders,
  setOpenFolders,
  onSelectNote,
  onRenameNote,
  onDeleteNote,
  onDeleteFolder,
  onRenameFolder,
  onDuplicateNote,
  onDuplicateFolder,
  isDragLocked,
  setIsDragLocked,
  activeNoteId,
  onSelectFolder,
  renderChildren = true,
}: {
  folder: Folder;
  openFolders: string[];
  setOpenFolders: React.Dispatch<React.SetStateAction<string[]>>;
  onSelectNote: (note: Note) => void;
  onRenameNote: (note: Note, newTitle: string) => void;
  onRenameFolder: (folder: Folder, newTitle: string) => void;
  onDeleteNote: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onDuplicateFolder: (folder: Folder) => void;
  isDragLocked: boolean;
  setIsDragLocked: (locked: boolean) => void;
  activeNoteId?: string;
  onSelectFolder?: (folder: Folder) => void;
  renderChildren?: boolean;
}) {
  const isDesktop = useIsDesktop();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    disabled: isDragLocked && !isDesktop,
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

  const clearBodyPointerEvents = () => {
    setTimeout(() => {
      if (document.body && document.body.style.pointerEvents === "none") {
        document.body.style.pointerEvents = "";
      }
    }, 50);
  };

  return (
    <div
      ref={setNodeRef}
      className={`rounded-md transition-colors ${isOver ? "bg-primary/30" : ""}`}
    >
      <div {...attributes} {...listeners} style={{}} ref={setDraggableNodeRef}>
        <Accordion
          type="multiple"
          value={renderChildren ? openFolders : []}
          onValueChange={(newValue) => {
            if (!renderChildren) return;
            if (
              openFolders.includes(folder.id) &&
              !newValue.includes(folder.id)
            ) {
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
            <DropdownMenu
              modal={!isDesktop}
              onOpenChange={setDropdownOpen}
              open={dropdownOpen}
            >
              <DropdownMenuTrigger
                asChild
                onPointerDown={(e) => e.preventDefault()}
                onClick={(e) => e.preventDefault()}
              >
                <AccordionTrigger
                  className={`h-12 min-w-60 w-full flex items-center ${isOver ? " " : "hover:bg-accent dark:hover:bg-accent"} truncate`}
                  arrow="left"
                  onClick={() => {
                    onSelectFolder?.(folder);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setDropdownOpen(true);
                  }}
                >
                  <h3 className="text-sm font-medium leading-tight truncate w-full font-bold">
                    {folder.title.substring(0, 25)}
                    {folder.title.length > 25 ? "..." : ""}
                  </h3>
                </AccordionTrigger>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={"w-48 rounded-md shadow-lg"}>
                {!isDesktop && (
                  <DropdownMenuItem
                    onSelect={() => setIsDragLocked(!isDragLocked)}
                  >
                    {isDragLocked ? (
                      <HandIcon className="mr-2 h-4 w-4" />
                    ) : (
                      <LockIcon className="mr-2 h-4 w-4" />
                    )}
                    {isDragLocked ? "Enable Dragging" : "Lock Position"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    onDuplicateFolder(folder);
                  }}
                >
                  <Copy /> Duplicate Folder
                </DropdownMenuItem>
                <AlertDialog
                  open={renameDialogOpen}
                  onOpenChange={setRenameDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
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
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Rename Folder</AlertDialogTitle>
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
                <AlertDialog open={deleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive dark:hover:bg-destructive-bg hover:bg-destructive-bg focus:bg-popover transition-colors duration-300"
                      onSelect={(e) => {
                        e.preventDefault();
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <p className={"text-muted-foreground"}>
                      This action cannot be undone. This will permanently delete
                      your folder and its contents and remove your data from our
                      servers.
                    </p>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => {
                          setDeleteDialogOpen(false);
                          clearBodyPointerEvents();
                        }}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          onDeleteFolder(folder.id);
                          setDeleteDialogOpen(false);
                          clearBodyPointerEvents();
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>

            <AccordionContent className="mt-2">
              {renderChildren && (
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
                        onDeleteFolder={onDeleteFolder}
                        onDuplicateNote={onDuplicateNote}
                        onDuplicateFolder={onDuplicateFolder}
                        isDragLocked={isDragLocked}
                        setIsDragLocked={setIsDragLocked}
                        activeNoteId={activeNoteId}
                        onSelectFolder={onSelectFolder}
                        renderChildren={renderChildren} // propagate the flag
                      />
                    </div>
                  ))}

                  {/* Notes */}
                  <SortableContext
                    items={folder.notes ?? []}
                    strategy={verticalListSortingStrategy}
                  >
                    {folder.notes?.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-md transition-colors"
                      >
                        <NoteItem
                          note={note}
                          onSelectNote={onSelectNote}
                          onRenameNote={onRenameNote}
                          onDeleteNote={onDeleteNote}
                          onDuplicateNote={onDuplicateNote}
                          activeNoteId={activeNoteId}
                          isDragLocked={isDragLocked}
                          setIsDragLocked={setIsDragLocked}
                        />
                      </div>
                    ))}
                  </SortableContext>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export default React.memo(FolderItem);
