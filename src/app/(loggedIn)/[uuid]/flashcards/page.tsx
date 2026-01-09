"use client";
import * as React from "react";

import { NoteSearcher } from "@/components/Flashcards/note-searcher";
import { use, useEffect, useState } from "react";
import { FlashcardSet, Note } from "@/lib/types";
import {
  generateAndSaveFlashcardsAction,
  loadFlashcardSets,
} from "@/lib/flashcards/flashcard-actions";
import { Button } from "@/components/ui/button";
import { Plus, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  loadDemoFolders,
  loadDemoNotes,
  loadFolders,
  loadNotes,
} from "@/lib/notes/note-storage";
import { collectAllNotes } from "@/lib/notes/note-and-folder-actions";
import {
  FlashcardSet as FlashcardSetComponent,
  FlashcardSetSkeleton,
} from "@/components/Flashcards/flashcard-set";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
interface PageProps {
  params: Promise<{ uuid: string }>;
}
export default function FlashcardsHomePage({ params }: PageProps) {
  const { uuid } = use(params);
  const [note, setNote] = React.useState<Note | null>(null);
  const [aiGenerateOpen, setAiGenerateOpen] = React.useState(false);
  const router = useRouter();
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [isLoadingSets, setIsLoadingSets] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSets, setFilteredSets] = useState<FlashcardSet[]>([]);
  const workerRef = React.useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("@/lib/flashcards/flashcard-search-worker.ts", import.meta.url),
    );
    workerRef.current.onmessage = (event) => {
      setFilteredSets(event.data);
    };
    return () => workerRef.current?.terminate();
  }, []);

  // Trigger Search when query or sets change
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ searchQuery, sets: flashcardSets });
    }
  }, [searchQuery, flashcardSets]);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        setIsLoadingSets(true);
        const result = await loadFlashcardSets(uuid);
        if (result.success && result.flashcardSets) {
          setFlashcardSets(result.flashcardSets);
        }
      } catch (err) {
        console.error("Error loading flashcard sets:", err);
      } finally {
        setIsLoadingSets(false);
      }
    };
    fetchFlashcardSets();
  }, [uuid]);

  useEffect(() => {
    const fetchNotesInBackground = async () => {
      try {
        setIsLoadingNotes(true);
        const loadedNotes = uuid ? await loadNotes(uuid) : loadDemoNotes();
        const loadedFolders = uuid
          ? await loadFolders(uuid)
          : loadDemoFolders();
        setAllNotes([...loadedNotes, ...collectAllNotes(loadedFolders)]);
      } catch (err) {
        console.error("Error pre-loading notes:", err);
      } finally {
        setIsLoadingNotes(false);
      }
    };
    fetchNotesInBackground();
  }, [uuid]);

  const generateFlashcards = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!note) return;

    const formData = new FormData(e.currentTarget);
    const count = Number(formData.get("count"));

    setAiGenerateOpen(false);

    toast.promise(
      (async () => {
        const result = await generateAndSaveFlashcardsAction(
          note.content,
          note.title,
          count,
          uuid
        );

        if (!result.success) throw new Error(result.error);

        // Redirect using the ID returned from the server
        router.push(`/${uuid}/flashcards/${result.setId}`);
        return "Flashcards generated!";
      })(),
      {
        loading: "AI is reading your note and building cards...",
        success: (msg) => msg,
        error: (err) => err.message,
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-semibold mt-5 text-center sm:text-left md:mt-0">
            Flashcard Sets
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="flex-1 md:flex-none">
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
              <DialogTitle>Create flashcards</DialogTitle>
              <form onSubmit={generateFlashcards} className="space-y-6 pt-4">
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
                  <Button type="submit" disabled={!note}>
                    Generate
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-10 w-full">
        <InputGroup className="rounded-full h-12 text-base">
          <InputGroupInput
            className="h-12"
            placeholder="Search flashcard sets"
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
          <div className="w-full py-24 flex flex-col items-center justify-center">
            <p className="text-lg text-foreground pb-2">
              {searchQuery ? "No sets match your search" : "No flashcard sets"}
            </p>
            {!searchQuery && (
              <div className="flex flex-col items-center justify-center text-center px-4">
                <p className="text-muted-foreground mb-6">
                  Get started by creating a set manually or using AI.
                </p>
                <Button onClick={() => setAiGenerateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Create First Set
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
