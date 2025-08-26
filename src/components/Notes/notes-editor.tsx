import {Note} from "@/types";
import {useEffect, useRef, useState} from "react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {ScrollArea} from "@/components/ui/scroll-area";
import NotesToolbar from "@/components/Notes/NotesToolbar/notes-toolbar";

interface NoteEditorProps {
	note: Note;
	title: string; // lifted title state
	setTitle: (title: string) => void; // setter from parent
	onDirtyChange?: (dirty: boolean) => void;
	editorRef?: React.RefObject<HTMLDivElement | null>;
	placeholder?: string;
}

export default function NotesEditor({
	                                    note,
	                                    title,
	                                    setTitle,
	                                    onDirtyChange = () => {},
	                                    editorRef,
	                                    placeholder = "Start writing your note here...",
                                    }: NoteEditorProps) {
	const [content, setContent] = useState(note.content);
	const internalRef = useRef<HTMLDivElement>(null);

	const refToUse = editorRef || internalRef;

	// Sync editable div with state
	useEffect(() => {
		if (refToUse.current && refToUse.current.innerHTML !== content) {
			refToUse.current.innerHTML = content;
		}
	}, [content, refToUse]);

	useEffect(() => {
		const dirty = title !== note.title || content !== note.content;
		onDirtyChange(dirty);
	}, [title, content, note.title, note.content, onDirtyChange]);

	const isEmptyContent = (html: string) => {
		const trimmed = html.replace(/<br\s*\/?>/gi, "").trim();
		return trimmed === "";
	};

	return (
		<div className="w-190 mx-auto flex flex-col h-full pt-15">
			<NotesToolbar editorRef={refToUse} setContent={setContent}/>
			<Input
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Note Title"
				className="h-16 !text-3xl p-5 font-bold border-none px-0 focus-visible:ring-0 bg-none"
			/>
			<ScrollArea className="flex-1 w-full text-toolbar-white">
				<div className="relative w-full h-full">
					{isEmptyContent(content) && (
						<div className="absolute top-1 left-1 pointer-events-none text-muted">
							{placeholder}
						</div>
					)}
					<div
						ref={refToUse}
						contentEditable
						suppressContentEditableWarning
						onInput={(e) => setContent(e.currentTarget.innerHTML ?? "")}
						className="editor-content w-full h-full outline-none break-words whitespace-pre-wrap p-1"
					/>
				</div>
			</ScrollArea>
		</div>
	);
}
