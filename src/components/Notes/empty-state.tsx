import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NotesEmptyStateProps {
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function NotesEmptyState({
  message,
  buttonText,
  onButtonClick,
}: NotesEmptyStateProps) {
  return (
    <div className={"flex items-center justify-center h-full"}>
      <div className={"text-center p-8"}>
        <p className={"text-muted-foreground mb-4"}>{message}</p>
        {buttonText && (
          <Button onClick={onButtonClick}>
            <Plus className={"h-4 w-4 mr-2"} />
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}
