import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NotesEmptyState from "@/components/Notes/empty-state";
import { Note } from "@/types";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/note-storage";
import { Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotesSidebarProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  createNewNote?: () => void;
  onDeletePopup: (id: string) => void;
  activeNoteId?: string;
}

export default function NotesSidebar({
  notes,
  onSelectNote,
  createNewNote,
  onDeletePopup,
  activeNoteId,
}: NotesSidebarProps) {
  return (
    <Card className="h-[calc(100vh-125px)] flex flex-col">
      <CardHeader>
        <CardTitle>My Notes</CardTitle>
      </CardHeader>
      <CardContent className={"flex-1"}>
        {notes.length === 0 ? (
          <NotesEmptyState
            message={"No notes yet"}
            buttonText={"Create your first note"}
            onButtonClick={createNewNote}
          />
        ) : (
          <ScrollArea className={"h-[calc(100vh-250px)] pr-5"}>
            <div className={"flex flex-col gap-2"}>
              {notes.map((note) => (
                <div
                  key={note.id ?? note.createdAt.toString()}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    activeNoteId === note.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "dark:hover:bg-accent/50"
                  }`}
                  onClick={() => onSelectNote(note)}
                >
                  <div className={"flex justify-between items-center"}>
                    <div>
                      <h3 className={"font-medium"}>
                        {note.title.substring(0, 30)}
                        {note.title.length > 30 ? "..." : ""}
                      </h3>
                      <p
                        className={`text-sm ${
                          activeNoteId === note.id
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePopup(note.id);
                          }}
                          variant="plain"
                          size="icon"
                          className={`h-8 w-8 cursor-pointer hover:bg-none ${
                            activeNoteId === note.id
                              ? "text-primary-foreground hover:text-destructive"
                              : "text-muted-foreground hover:text-destructive"
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Delete Note</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
