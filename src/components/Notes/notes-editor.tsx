import { Note } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotesToolbar from "@/components/Notes/NotesToolbar/notes-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "dompurify";
import { useIsDesktop } from "@/lib/utils";

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
  const isDesktop = useIsDesktop();

  const [editorSelected, setEditorSelected] = useState(false);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || !refToUse.current) {
        setEditorSelected(false);
        return;
      }

      const anchorNode = selection.anchorNode;
      const isInsideEditor =
        anchorNode &&
        refToUse.current.contains(
          anchorNode.nodeType === Node.TEXT_NODE
            ? anchorNode.parentNode
            : anchorNode,
        );

      setEditorSelected(!!isInsideEditor);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [refToUse]);

  useEffect(() => {
    if (refToUse.current) {
      if (refToUse.current.innerHTML !== note.content) {
        refToUse.current.innerHTML = note.content;
        setContent(note.content);
      }
    }
  }, [note.id]);

  useEffect(() => {
    const dirty = title !== note.title || content !== note.content;
    onDirtyChange(dirty);
  }, [title, content, note.title, note.content, onDirtyChange]);

  const isEmptyContent = (text: string) =>
    text.replace("<br>", "").length === 0;

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const rawHTML = e.currentTarget.innerHTML ?? "";
    const cleanHTML = DOMPurify.sanitize(rawHTML, {
      ALLOWED_TAGS: [
        "b",
        "i",
        "u",
        "span",
        "div",
        "br",
        "h1",
        "h2",
        "h3",
        "p",
        "font",
      ],
      ALLOWED_ATTR: ["style", "class", "color"],
    });
    setContent(cleanHTML);
  };

  if (loading) {
    return (
      <div
        className={`${isDesktop ? "lg:max-w-190 md:max-w-80 w-[80%]" : "w-full pl-5 pr-5"} mx-auto flex flex-col h-full pt-15`}
      >
        <Skeleton className="h-16 w-full mb-3 rounded-md bg-popover" />
        <div className="flex flex-col gap-2 p-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded-md bg-popover" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      key={note.id}
      className={`mx-auto flex flex-col h-full pt-15 ${isDesktop ? "lg:max-w-190 md:max-w-80 w-[80%]" : "w-full pl-5 pr-5"}`}
    >
      <NotesToolbar
        editorRef={refToUse}
        setContent={setContent}
        editorSelected={editorSelected}
      />
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note Title"
        className="h-16 !text-3xl p-5 font-bold border-none px-0 focus-visible:ring-0"
      />
      <div className="relative w-full flex-1 text-toolbar-white">
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
          className="editor-content cursor-text w-full outline-none break-words break-all whitespace-pre-wrap p-1 [overflow-wrap:anywhere]"
          style={{
            wordBreak: "break-word",
          }}
        />
      </div>
    </div>
  );
}
