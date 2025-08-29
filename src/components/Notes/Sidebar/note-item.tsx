import { Note } from "@/types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem, ContextMenuLabel,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {Copy, ExternalLink, Link, PencilLine, Trash2} from "lucide-react";
import React, { useState } from "react";
import { useParams, usePathname } from "next/navigation";
import {
  copyUrlToClipboard,
  openNoteInNewTab,
} from "@/lib/notes/note-item-actions";
import { toast } from "sonner";
import {Separator} from "@/components/ui/separator";
import {formatDate} from "@/lib/note-storage";
import {Input} from "@/components/ui/input";

export default function NoteItem({
  note,
  activeNoteId,
  onSelectNote,
  onDeleteNote,
  onDuplicateNote,
  onRenameNote,
}: {
  note: Note;
  activeNoteId?: string;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onRenameNote: (note: Note, newTitle: string) => void;
}) {
  const { uuid } = useParams() as { uuid: string };

  const isDemo = usePathname().includes("demo");
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(note.title);

  const [dialogOpen, setDialogOpen] = useState(false);
  const clearBodyPointerEvents = () => {
    // defer to end of tick to let Radix finish unmounting
    setTimeout(() => {
      if (document.body && document.body.style.pointerEvents === "none") {
        document.body.style.pointerEvents = "";
      }
    }, 50);
  };
  return (
    <>
      <ContextMenu modal={false}>
        <ContextMenuTrigger asChild>
          <div
            className={`w-full p-3 rounded-md cursor-pointer transition-colors ${
              activeNoteId === note.id
                ? "bg-primary text-primary-foreground shadow-xs dark:hover:bg-primary/90"
                : "dark:hover:bg-accent"
            }`}
            onClick={() => onSelectNote(note)}
          >
            {isRenaming ? (
              <Input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onRenameNote?.(note, newTitle.trim() || note.title);
                    setIsRenaming(false);
                  }
                  if (e.key === "Escape") {
                    setNewTitle(note.title);
                    setIsRenaming(false);
                  }
                }}
                onBlur={() => {
                  // optional: only close if the input wasn't just opened
                  setTimeout(() => setIsRenaming(false), 100);
                }}
                className="w-full"
              />
            ) : (
              <h3 className="font-medium truncate block">
                {note.title.substring(0, 25)}
                {note.title.length > 25 ? "..." : ""}
              </h3>
            )}


          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-48 rounded-md shadow-lg">
          <ContextMenuItem
            onClick={() => {
              setTimeout(() => setIsRenaming(true), 50);
            }}
          >
            <PencilLine />
            Rename
          </ContextMenuItem>

          {!isDemo ? (
            <div>
              <ContextMenuItem
                onClick={() => {
                  copyUrlToClipboard(uuid, note.id);
                  toast.success("Url copied to clipboard!");
                }}
              >
                <Link/>
                Copy Link
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  openNoteInNewTab(uuid, note.id);
                }}
              >
                <ExternalLink/>
                Open in new tab
              </ContextMenuItem>
            </div>
          ) : (
            <></>
          )}

          <ContextMenuItem
            onClick={() => {
              note ? onDuplicateNote?.(note) : null
            }}
          >
            <Copy/>
            Duplicate Note
          </ContextMenuItem>

          <AlertDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) clearBodyPointerEvents();
            }}
          >
            <AlertDialogTrigger asChild>
              <ContextMenuItem
                className="text-destructive dark:hover:bg-destructive-bg focus:bg-popover transition-colors duration-300"
                onSelect={(e) => {
                  // keep the menu from interfering while the dialog opens
                  e.preventDefault();
                  setDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2"/> Delete
              </ContextMenuItem>
            </AlertDialogTrigger>

            <AlertDialogContent
              // optional: avoid weird refocus back to the menu anchor
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your note and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
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

          <Separator/>

          <h3 className="text-muted font-bold p-2 text-center text-xs cursor-default">
            Created On {formatDate(note.createdAt)}
          </h3>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}
