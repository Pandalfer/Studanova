import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NotesHeaderProps {
  onNewNote: () => void;
}

export default function NotesHeader({ onNewNote }: NotesHeaderProps) {
  return (
    <header className="border-b p-4">
      <div className={"container mx-auto flex justify-between items-center"}>
        <h1 className={"text-2xl font-bold"}>Studanova Notes</h1>
        <Button onClick={onNewNote} size={"sm"} className={"cursor-pointer"}>
          <Plus className={"h-4 w-4 mr-2"} /> New Note
        </Button>
      </div>
    </header>
  );
}
