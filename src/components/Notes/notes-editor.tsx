import { Note } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotesToolbar from "@/components/Notes/NotesToolbar/notes-toolbar";
import { Skeleton } from "@/components/ui/skeleton";

interface NoteEditorProps {
  note: Note;
  title: string;
  setTitle: (title: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
  editorRef?: React.RefObject<HTMLDivElement | null>;
  placeholder?: string;
  loading?: boolean;
}

export default function NotesEditor({
  note,
  title,
  setTitle,
  onDirtyChange = () => {},
  editorRef,
  placeholder = "Start writing your note here...",
  loading = false,
}: NoteEditorProps) {
  const [content, setContent] = useState(note.content);
  const internalRef = useRef<HTMLDivElement>(null);
  const refToUse = editorRef || internalRef;

  // Only initialize content on mount or when note changes
  useEffect(() => {
    // Only reset editor if switching to a different note
    if (refToUse.current) {
      if (refToUse.current.innerHTML !== note.content) {
        refToUse.current.innerHTML = note.content;
        setContent(note.content);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]); // only depend on note.id, not note.content

  // Track dirty state
  useEffect(() => {
    const dirty = title !== note.title || content !== note.content;
    onDirtyChange(dirty);
  }, [title, content, note.title, note.content, onDirtyChange]);

  const isEmptyContent = (text: string) =>
    text.replace("<br>", "").length === 0;

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML ?? "");
  };



  if (loading) {
    return (
      <div className="w-190 mx-auto flex flex-col h-full pt-15">
        <Skeleton className="h-16 w-full mb-3 rounded-md bg-popover" />
        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col gap-2 p-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full rounded-md bg-popover" />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (

      <div key={note.id} className="w-190 mx-auto flex flex-col h-full pt-15">
        <NotesToolbar editorRef={refToUse} setContent={setContent}/>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="h-16 !text-3xl p-5 font-bold border-none px-0 focus-visible:ring-0"
        />
        <div className="relative w-full h-full flex-1 text-toolbar-white">
          {isEmptyContent(content) && (
            <div className="absolute top-1 left-1 pointer-events-none text-muted">
              {placeholder}
            </div>
          )}
          <div
            ref={refToUse}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="editor-content cursor-text w-full h-full outline-none break-words whitespace-pre-wrap p-1 [overflow-wrap:anywhere]"
          />
        </div>
      </div>

  );
}
