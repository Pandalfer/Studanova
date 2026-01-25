"use client";

import React, { useEffect, useState } from "react";
import { SidebarDesktop } from "@/components/Navigation/Sidebar/sidebar-desktop";
import { Home, Notebook, SquareStack } from "lucide-react";
import { SidebarMobile } from "@/components/Navigation/Sidebar/sidebar-mobile";
import { SidebarButton } from "@/components/Navigation/Sidebar/sidebar-button";
import { useIsDesktop } from "@/lib/utils";

interface SidebarProps {
  uuid?: string;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isDemo?: boolean;
}

export function Sidebar({
  uuid,
  isCollapsed,
  setIsCollapsed,
  isDemo = false,
}: SidebarProps) {
  const isDesktop = useIsDesktop();

  const [username, setUsername] = useState<string>("Loading...");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (isDemo) {
        setUsername("Guest");
        setError("");
        return;
      }

      try {
        const res = await fetch("/api/user/get-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid }),
        });

        if (!res.ok) {
          console.log("Failed to fetch user info");
          return;
        }

        const data = await res.json();
        setUsername(data.username || "Unknown User");
      } catch {
        setError("Failed to load user");
        setUsername("Unknown");
      }
    })();
  }, [uuid, isDemo]);

  const basePath = isDemo ? "/demo" : `/${uuid}`;

  const sidebarItems = {
    links: [
      { label: "Home", href: `${basePath}/home`, icon: Home },
      { label: "Notes", href: `${basePath}/notes`, icon: Notebook },
      {
        label: "Flashcards",
        href: `${basePath}/flashcards`,
        icon: SquareStack,
      },
    ],
    extras: (
      <div className={"flex flex-col gap-2"}>
        <SidebarButton className={"w-full justify-center"} variant={"default"}>
          More content soon
        </SidebarButton>
      </div>
    ),
  };

  if (isDemo === false && error)
    return <div className="text-red-500 p-3">{error}</div>;
  if (isDemo === false && !username)
    return <div className="p-3">Loading user info...</div>;

  if (isDesktop) {
    return (
      <SidebarDesktop
        sidebarItems={sidebarItems}
        username={username}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        isDemo={true}
      />
    );
  } else {
    return <SidebarMobile sidebarItems={sidebarItems} username={username} />;
  }
}
