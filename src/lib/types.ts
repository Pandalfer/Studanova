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
  createdAt: number;
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

export interface FolderInput {
  title: string;
}
