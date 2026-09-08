import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Note } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

type NoteSearcherProps = {
  setSelectedNote: (note: Note | null) => void;
  notes: Note[];
  isLoading: boolean;
};

export function NoteSearcher({
  setSelectedNote,
  notes,
  isLoading,
}: NoteSearcherProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const isSearching = searchQuery.trim().length > 0;
  const [matchingNotes, setMatchingNotes] = React.useState<Note[]>([]);
  const workerRef = React.useRef<Worker | null>(null);
  const [id, setId] = React.useState("");

  React.useEffect(() => {
    workerRef.current = new Worker(
      new URL("@/lib/notes/notes-search-worker.ts", import.meta.url),
    );

    workerRef.current.onmessage = (event) => {
      setMatchingNotes(event.data);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  React.useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        searchQuery,
        notes,
        folders: [],
      });
    }
  }, [searchQuery, notes]);

  const displayNotes = isSearching ? matchingNotes : notes;

  const handleSelect = (selectedId: string) => {
    const newId = selectedId === id ? "" : selectedId;
    setId(newId);
    const foundNote = notes.find((n) => n.id === newId) || null;
    setSelectedNote(foundNote);

    setOpen(false);
  };

  const selectedNoteTitle = id
    ? notes.find((note) => note.id === id)?.title
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full flex items-center justify-between px-3 overflow-hidden"
        >
          <div
            className="flex-1 min-w-0 text-left"
            style={{
              maxWidth: "calc(min(40vw, 400px))",
            }}
          >
            <span className="block truncate">
              {selectedNoteTitle || "Select Note..."}
            </span>
          </div>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search Notes..."
            className="h-9"
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <ScrollArea className="h-60">
              <CommandGroup className={"w-[250px] md:w-[240px]"}>
                {displayNotes.map((note) => (
                  <CommandItem
                    key={note.id}
                    value={note.id}
                    onSelect={handleSelect}
                    className="cursor-pointer flex"
                  >
                    <span className="truncate flex-1 min-w-0">
                      {note.title}
                    </span>
                    <Check
                      className={cn(
                        "ml-2 shrink-0",
                        id === note.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>

              {displayNotes.length === 0 && (
                <div className="text-center text-sm">
                  {isLoading ? (
                    <>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <CommandItem
                          key={i}
                          disabled
                          className="flex items-center gap-0"
                        >
                          <Skeleton className="h-8 w-full -mt-2 rounded-sm bg-muted/50" />
                        </CommandItem>
                      ))}
                    </>
                  ) : (
                    <p className={"py-6"}>No results found.</p>
                  )}
                </div>
              )}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
