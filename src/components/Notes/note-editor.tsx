"use client";

import { Note } from "@/types";
import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotesToolbar from "@/components/Notes/notes-toolbar";

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
  onDirtyChange = () => {},
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const editorRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);

  // Sync editable div with state without breaking cursor
  useEffect(() => {
    if (editableRef.current && editableRef.current.innerHTML !== content) {
      editableRef.current.innerHTML = content;
    }
  }, [content]);

  // Track dirty state
  useEffect(() => {
    const dirty = title !== note.title || content !== note.content;
    onDirtyChange(dirty);
  }, [title, content, note.title, note.content, onDirtyChange]);

  const handleSave = () => {
    onSave({
      ...note,
      title: title.trim() || "Untitled Note",
      content,
    });
  };

  return (
    <Card
      className="h-[calc(100vh-125px)] flex flex-col relative"
      ref={editorRef}
    >
      <NotesToolbar editorRef={editableRef} setContent={setContent} />

      <CardHeader>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="text-xl font-bold border-none px-0 focus-visible:ring-0 bg-none"
        />
      </CardHeader>

      <CardContent
        className="flex-1 flex flex-col cursor-text"
        onClick={() => editableRef.current?.focus()} // focus on click anywhere in content
      >
        <ScrollArea className="flex-1">
          <div className="pr-4 h-full">
            <div
              ref={editableRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => setContent(e.currentTarget.innerHTML ?? "")}
              className="w-full h-full outline-none break-words whitespace-pre-wrap"
            />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
