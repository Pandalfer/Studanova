import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface SidebarItems {
  links: Array<{
    label: string;
    href: string;
    icon?: LucideIcon;
  }>;
  extras?: ReactNode;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  lastEdited?: number;
  folderId?: string;
}

export interface Folder {
  id: string;
  title: string;
  studentId?: string;
  notes: Note[];
  folders: Folder[];
  parentId?: string;
}

export interface ImportFolder {
  title: string;
  notes: {
    title: string;
    content: string;
    lastEdited?: number;
  }[];
  folders: ImportFolder[];
}

export interface FolderInput {
  title: string;
}

export interface Flashcard {
  id?: string;
  question: string;
  answer: string;
  setId: string;
  progress: number;
}

export interface FlashcardSet {
  id?: string;
  title: string;
  description?: string;
  flashcards?: Flashcard[];
  studentId: string;
}
