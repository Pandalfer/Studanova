"use client";
import { useEffect, useState } from "react";
import React from "react";

interface PageProps {
  params: Promise<{ uuid: string }>;
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

        // Fetch notes
        const notesResponse = await fetch("/api/notes/load-notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid }),
        });

        if (!notesResponse.ok) {
          console.error("Failed to load notes");
          return;
        }

        const notesData = await notesResponse.json();
        setNumberOfNotes(notesData.notes.length);
      } catch {
        setError("An unexpected error occurred");
      }
    })();
  }, [uuid]);

  if (error) return <div>{error}</div>;
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
