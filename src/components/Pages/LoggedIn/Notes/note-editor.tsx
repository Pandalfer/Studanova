"use client";

import { Note } from "@/types";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";

interface NoteEditorProps {
  note: Note;
  onCancel: () => void;
  onSave: (note: Note) => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export default function NoteEditor({
  note,
  onCancel,
  onSave,
  onDirtyChange = (dirty: boolean) => { /* no-op by default */ },
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    onSave({
      ...note,
      title: title.trim() || "Untitled Note",
      content,
    });
  };

  useEffect(() => {
    const dirty = title !== note.title || content !== note.content;
    onDirtyChange(dirty);
  }, [title, content, note.title, note.content, onDirtyChange]);


  return (
    <Card className="h-[calc(100vh-125px)] flex flex-col">
      <CardHeader>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-xl font-bold border-none px-0 focus-visible:ring-0 bg-none"
        ></Input>
      </CardHeader>
      <CardContent className={"flex-1"}>
        <ScrollArea className="h-[calc(100vh-350px)]">
          <div className="pr-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="w-full min-h-full resize-none overflow-hidden border-none focus-visible:ring-0 dark:bg-card p-0"
            />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className={"flex justify-end space-x-2"}>
        <Button variant={"outline"} onClick={onCancel}>
          <X className={"h-4 w-4 mr-2"} />
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className={"h-4 w-4 mr-2"} />
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
