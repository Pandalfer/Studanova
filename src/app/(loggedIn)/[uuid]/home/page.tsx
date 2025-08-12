"use client";
import { useEffect, useState } from "react";
import React from "react";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default function LoggedInHome({ params }: PageProps) {
  const { uuid } = React.use(params); // ✅ unwrap params

  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/user/get-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid }),
        });

        if (!response.ok) throw new Error("User fetch failed");
        const data = await response.json();
        setUsername(data.username);
      } catch (err) {
        setError("Failed to load user");
      }
    }

    fetchUser();
  }, [uuid]);

  if (error) return <div>{error}</div>;
  if (!username) return <div>Loading...</div>;

  return (
    <div className="">
      <h1 className="text-white text-3xl font-bold">
        Welcome back, {username}!
      </h1>
    </div>
  );
}
