
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
    <Card className="h-[calc(100vh-125px)] flex flex-col">
      <CardHeader>
        <CardTitle>{note.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {formatDate(note.createdAt)}
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-full">
          <div className="pr-4 whitespace-pre-wrap">{note.content}</div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={onEdit}>Edit Note</Button>
      </CardFooter>
    </Card>
  );
}
