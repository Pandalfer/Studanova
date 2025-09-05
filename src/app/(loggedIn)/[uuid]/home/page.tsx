"use client";
import { useEffect, useState } from "react";
import React from "react";
import { toast } from "sonner";
import {loadFolders, loadNotes} from "@/lib/note-storage";
import {Folder, Note} from "@/types";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

function collectAllNotes(folders: Folder[]): Note[] {
  const result: Note[] = [];
  for (const folder of folders) {
    result.push(...folder.notes);
    if (folder.folders && folder.folders.length > 0) {
      result.push(...collectAllNotes(folder.folders));
    }
  }
  return result;
}

export default function LoggedInHome({ params }: PageProps) {
  const { uuid } = React.use(params);

  const [username, setUsername] = useState<string | null>(null);
  const [numberOfNotes, setNumberOfNotes] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // Fetch user info
        const userResponse = await fetch("/api/user/get-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid }),
        });

        if (!userResponse.ok) {
          setError("Failed to load user info");
          return;
        }

        const userData = await userResponse.json();
        setUsername(userData.username);

        const loadedNotes = await loadNotes(uuid);
        const loadedFolders = await loadFolders(uuid);


        const allNotes = [
          ...loadedNotes,
          ...collectAllNotes(loadedFolders)
        ];

        setNumberOfNotes(allNotes.length);
      } catch {
        setError("An unexpected error occurred");
      }
    })();
  }, [uuid]);

  if (error) {
    toast.error(error);
    return;
  }
  if (!username) return <div>Loading...</div>;

  return (
    <div className="w-full min-h-screen flex items-center justify-center flex-col gap-10">
      <h1 className="text-white text-3xl font-bold">
        Welcome back, {username}!
      </h1>
      <p className="text-muted mt-2">
        You have {numberOfNotes !== null ? numberOfNotes : "loading..."} notes.
      </p>
    </div>
  );
}
