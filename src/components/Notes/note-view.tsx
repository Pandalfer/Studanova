import { Note } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/note-storage";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NoteViewProps {
  note: Note;
  onEdit: () => void;
}

export default function NoteView({ note, onEdit }: NoteViewProps) {
  return (
    <Card className="h-[calc(100vh-125px)] flex flex-col relative">
      <CardHeader>
        <CardTitle>{note.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {formatDate(note.createdAt)}
        </p>
      </CardHeader>

      {/* Make CardContent fill remaining space and allow scroll inside */}
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="pr-4 w-full break-words editor-content whitespace-pre-wrap">
            {note.content && note.content.replace(/<[^>]*>/g, "").trim() ? (
              <div dangerouslySetInnerHTML={{ __html: note.content }} />
            ) : (
              <em className="text-muted-foreground">No Note Content</em>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={onEdit}>Edit Note</Button>
      </CardFooter>
    </Card>
  );
}
