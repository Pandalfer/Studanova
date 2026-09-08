import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FlashcardSet, Note } from "@/lib/types";
import * as React from "react";
import {
  createFlashcardSet,
  generateFlashcardsFromNote,
  loadFlashcardSets,
  getFlashcardUsage,
} from "@/lib/server-actions/flashcards";
import {
  loadDemoFolders,
  loadDemoNotes,
  loadFolders,
  loadNotes,
} from "@/lib/notes/note-storage";
import { collectAllNotes } from "@/lib/notes/note-and-folder-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {Loader2, Plus, Search, X} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { NoteSearcher } from "@/components/Flashcards/note-searcher";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  FlashcardSet as FlashcardSetComponent,
  FlashcardSetSkeleton,
} from "@/components/Flashcards/flashcard-set";
import {
  createFlashcardSetDemo,
  loadFlashcardSetsDemo, saveFlashcardsBulkDemo,
} from "@/lib/flashcards/flashcard-actions";

interface FlashcardsContentProps {
  uuid: string;
  isDemo?: boolean;
}

export function FlashcardsManager({ uuid, isDemo }: FlashcardsContentProps) {
  const router = useRouter();

  const [note, setNote] = useState<Note | null>(null);
  const [aiGenerateOpen, setAiGenerateOpen] = useState(false);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [filteredSets, setFilteredSets] = useState<FlashcardSet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [usage, setUsage] = useState<{ remaining: number | null, limit: number | null }>({ remaining: null, limit: null });

  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isLoadingSets, setIsLoadingSets] = useState(true);

  const workerRef = React.useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("@/lib/flashcards/flashcard-search-worker.ts", import.meta.url),
    );
    workerRef.current.onmessage = (e) => setFilteredSets(e.data);
    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    workerRef.current?.postMessage({ searchQuery, sets: flashcardSets });
  }, [searchQuery, flashcardSets]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingSets(true);
      setIsLoadingNotes(true);

      try {
        const usageResult = await getFlashcardUsage(uuid);
        setUsage({
          remaining: usageResult.remaining,
          limit: usageResult.limit
        });

        const setsResult = isDemo
          ? await loadFlashcardSetsDemo()
          : await loadFlashcardSets(uuid);

        if (setsResult.success) {
          setFlashcardSets(setsResult.data);
          setFilteredSets(setsResult.data);
        }

        const loadedNotes = isDemo ? loadDemoNotes() : await loadNotes(uuid);
        const loadedFolders = isDemo
          ? loadDemoFolders()
          : await loadFolders(uuid);
        setAllNotes([...loadedNotes, ...collectAllNotes(loadedFolders)]);
      } catch (err) {
        console.error("Failed to sync data:", err);
        toast.error("Connection error. Using local cached data.");
      } finally {
        setIsLoadingSets(false);
        setIsLoadingNotes(false);
      }
    };

    loadData();
  }, [uuid, isDemo]);

  const handleCreateManual = async () => {
    const response = isDemo
      ? await createFlashcardSetDemo(uuid, {
          title: "New Set",
          description: "",
        })
      : await createFlashcardSet(uuid, { title: "New Set", description: "" });

    if (response.success) {
      router.push(`/${uuid}/flashcards/${response.data.id}/edit`);
    } else {
      toast.error("Failed to create new set.");
    }
  };

  const handleAiGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!note) return;

    const formData = new FormData(e.currentTarget);
    const count = Number(formData.get("count"));
    setAiGenerateOpen(false);

    toast.promise(
      (async () => {
        const res = await generateFlashcardsFromNote({
          uuid, // "demo"
          noteTitle: note.title,
          noteContent: note.content,
          count,
        });

        if (!res.success) throw new Error(res.error);

        const usageUpdate = await getFlashcardUsage(uuid);
        setUsage({ remaining: usageUpdate.remaining, limit: usageUpdate.limit });


        if (res.data.isDemo) {

          const setRes = await createFlashcardSetDemo("demo", {
            title: note.title,
            description: `Generated from: ${note.title}`
          });

          if (!setRes.success) throw new Error("Failed to save demo set");

          // 2. Add the AI cards to that Set
          const cardsToSave = res.data.cards.map(c => ({
            ...c,
            setId: setRes.data.id!,
            progress: 0,
            id: "temp-id"
          }));

          await saveFlashcardsBulkDemo(cardsToSave);

          router.push(`/demo/flashcards/${setRes.data.id}`);
        } else {

          router.push(`/${uuid}/flashcards/${res.data.setId}`);
        }
      })(),
      {
        loading: "AI is thinking...",
        success: "Flashcards generated!",
        error: (err) => err.message || "Failed to generate.",
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <h1 className="text-2xl font-semibold mt-5 text-center sm:text-left md:mt-0">
          Flashcard Sets
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="flex-1 md:flex-none"
            onClick={handleCreateManual}
          >
            <Plus className="mr-2 h-4 w-4" /> New Set
          </Button>

          <Dialog
            modal={false}
            open={aiGenerateOpen}
            onOpenChange={setAiGenerateOpen}
          >
            <DialogTrigger asChild>
              <Button variant="default" className="flex-1 md:flex-none">
                <Plus className="mr-2 h-4 w-4" /> AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Create flashcards with AI</DialogTitle>

              <div className="text-xs text-muted-foreground mt-1 flex flex-col gap-0.5">
                <p>{isDemo ? "Log In for more uses" : ""}</p>
                {usage.remaining !== null ? (
                  <p className={usage.remaining === 0 ? "text-red-500 font-medium" : ""}>
                    {usage.remaining} / {usage.limit} generations left this month
                  </p>
                ) : (
                  <Loader2 className="h-3 w-3 animate-spin mt-1"/>
                )}
              </div>

              <form onSubmit={handleAiGenerate} className="space-y-6 pt-2">
                <div className="space-y-2">
                  <Label>Source Note</Label>
                  <NoteSearcher
                    setSelectedNote={setNote}
                    notes={allNotes}
                    isLoading={isLoadingNotes}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="count">Number of flashcards</Label>
                  <Input
                    id="count"
                    name="count"
                    type="number"
                    min={1}
                    max={50}
                    required
                    defaultValue={5}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setAiGenerateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!note || usage.remaining === 0}>
                    {usage.remaining === 0 ? "Limit Reached" : "Generate"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-10 w-full">
        <InputGroup className="rounded-full h-12 text-base">
          <InputGroupInput
            className="h-12"
            placeholder="Search sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon className="pl-4 pr-1">
            {searchQuery ? (
              <X
                className="h-5 w-5 cursor-pointer"
                onClick={() => setSearchQuery("")}
              />
            ) : (
              <Search className="h-5 w-5 text-muted-foreground" />
            )}
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Grid Display */}
      <div className="flex flex-col gap-3">
        {isLoadingSets ? (
          Array.from({ length: 4 }).map((_, i) => (
            <FlashcardSetSkeleton key={i} />
          ))
        ) : filteredSets.length > 0 ? (
          filteredSets.map((set) => (
            <FlashcardSetComponent key={set.id} uuid={uuid} {...set} />
          ))
        ) : (
          <FlashcardManagerEmptyState
            onAiClick={() => setAiGenerateOpen(true)}
            hasQuery={!!searchQuery}
          />
        )}
      </div>
    </div>
  );
}

function FlashcardManagerEmptyState({
                                      onAiClick,
                                      hasQuery,
                                    }: {
  onAiClick: () => void;
  hasQuery: boolean;
}) {
  return (
    <div className="w-full py-24 flex flex-col items-center justify-center text-center">
      <p className="text-lg text-foreground pb-2">
        {hasQuery ? "No sets match your search" : "No flashcard sets"}
      </p>
      {!hasQuery && (
        <>
          <p className="text-muted-foreground mb-6">
            Get started by creating a set manually or using AI.
          </p>
          <Button onClick={onAiClick}>
            <Plus className="mr-2 h-4 w-4" /> Create First Set
          </Button>
        </>
      )}
    </div>
  );
}