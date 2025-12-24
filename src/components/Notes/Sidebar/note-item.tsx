"use client";

import { Note } from "@/lib/types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Copy, ExternalLink, Link, PencilLine, Trash2 } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import {
  copyUrlToClipboard,
  openNoteInNewTab,
} from "@/lib/notes/note-and-folder-actions";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/notes/note-storage";
import { Input } from "@/components/ui/input";
import { useDraggable } from "@dnd-kit/core";
function NoteItem({
  note,
  activeNoteId,
  onSelectNote,
  onDeleteNote,
  onDuplicateNote,
  onRenameNote,
  handleNoteSelect,
}: {
  note: Note;
  activeNoteId?: string;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onRenameNote: (note: Note, newTitle: string) => void;
  handleNoteSelect?: (note: Note) => void;
}) {
  const { uuid } = useParams() as { uuid: string };

  const isDemo = usePathname().includes("demo");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(note.title);

  const clearBodyPointerEvents = () => {
    setTimeout(() => {
      if (document.body && document.body.style.pointerEvents === "none") {
        document.body.style.pointerEvents = "";
      }
    }, 50);
  };

  const finishRename = () => {
    const trimmed = newTitle.trim();
    setRenameDialogOpen(false);

    if (!trimmed) {
      setNewTitle(note.title); // revert if empty
      return;
    }

    if (trimmed !== note.title) {
      onRenameNote?.(note, trimmed);
    }
  };
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: note.id,
    data: { type: "note" },
  });
  const handleSelect = useCallback(
    () => onSelectNote(note),
    [note, onSelectNote],
  );

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={{}}>
      <ContextMenu modal={false}>
        <ContextMenuTrigger asChild>
          <div
            className={`w-full min-w-60 p-3 rounded-md cursor-pointer transition-colors flex items-center h-12
            ${
              activeNoteId === note.id
                ? "bg-primary text-primary-foreground shadow-xs dark:hover:bg-primary/90 hover:bg-primary/90"
                : "dark:hover:bg-accent hover:bg-accent"
            }`}
            onClick={() => {
              handleSelect();
              handleNoteSelect?.(note);
            }}
          >
            <h3 className="text-sm font-medium leading-tight truncate w-full">
              {note.title.substring(0, 40)}
              {note.title.length > 40 ? "..." : ""}
            </h3>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-48 rounded-md shadow-lg">
          {/* Rename with popup */}
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
                      document.querySelector<HTMLInputElement>("#rename-input");
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
                    setNewTitle(note.title);
                  }
                }}
                autoFocus
              />
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setRenameDialogOpen(false);
                    setNewTitle(note.title);
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

          {!isDemo && (
            <>
              <ContextMenuItem
                onClick={async () => {
                  await copyUrlToClipboard(uuid, note.id);
                  toast.success("Url copied to clipboard!");
                }}
              >
                <Link /> Copy Link
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  openNoteInNewTab(uuid, note.id);
                }}
              >
                <ExternalLink /> Open in new tab
              </ContextMenuItem>
            </>
          )}

          <ContextMenuItem onClick={() => onDuplicateNote?.(note)}>
            <Copy /> Duplicate Note
          </ContextMenuItem>

          {/* Delete Dialog */}
          <AlertDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) clearBodyPointerEvents();
            }}
          >
            <AlertDialogTrigger asChild>
              <ContextMenuItem
                className="text-destructive dark:hover:bg-destructive-bg hover:bg-destructive-bg focus:bg-popover transition-colors duration-300"
                onSelect={(e) => {
                  e.preventDefault();
                  setDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </ContextMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              </AlertDialogHeader>
              <p className={"text-muted-foreground"}>
                This action cannot be undone. This will permanently delete your
                note and remove your data from our servers.
              </p>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setDialogOpen(false);
                    clearBodyPointerEvents();
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDeleteNote(note.id);
                    setDialogOpen(false);
                    clearBodyPointerEvents();
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Separator className="m-2" />
          <h3 className="text-muted font-bold text-center text-xs cursor-default pb-2">
            Created On {formatDate(note.createdAt)}
          </h3>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

export default React.memo(NoteItem);
