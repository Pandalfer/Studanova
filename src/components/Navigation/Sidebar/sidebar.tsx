// Sidebar.tsx
"use client";

import React, { useEffect, useState } from "react";
import { SidebarDesktop } from "@/components/Navigation/Sidebar/sidebar-desktop";
import {
  Home,
  User,
  Layers,
  CheckSquare,
  Calendar,
  Notebook,
  Timer,
} from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { SidebarMobile } from "@/components/Navigation/Sidebar/sidebar-mobile";
import { SidebarButton } from "@/components/Navigation/Sidebar/sidebar-button";

interface SidebarProps {
  uuid: string;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isDemo?: boolean; // new optional prop
}

export function Sidebar({
                          uuid,
                          isCollapsed,
                          setIsCollapsed,
                          isDemo = false,
                        }: SidebarProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)", {
    initializeWithValue: false,
  });

  const [username, setUsername] = useState<string>("Loading...");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // If demo mode, skip fetch and set Guest immediately
    if (isDemo) {
      setUsername("Guest");
      setError("");
      return;
    }

    async function fetchUser() {
      try {
        const res = await fetch("/api/user/get-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid }),
        });

        if (!res.ok) throw new Error("Failed to fetch user info");

        const data = await res.json();
        setUsername(data.username || "Unknown User");
      } catch {
        setError("Failed to load user");
        setUsername("Unknown");
      }
    }

    fetchUser();
  }, [uuid, isDemo]);

  const basePath = isDemo ? "/demo" : `/${uuid}`;

  const sidebarItems = {
    links: [
      { label: "Home", href: `${basePath}/home`, icon: Home },
      { label: "Notes", href: `${basePath}/notes`, icon: Notebook },
    ],
    extras: (
      <div className={"flex flex-col gap-2"}>
        <SidebarButton className={"w-full justify-center"} variant={"default"}>
          More content soon
        </SidebarButton>
      </div>
    ),
  };

  if (isDemo === false && error) return <div className="text-red-500 p-3">{error}</div>;
  if (isDemo === false && !username) return <div className="p-3">Loading user info...</div>;

  // In demo mode we already have username = "Guest", so render normally
  if (isDesktop) {
    return (
      <SidebarDesktop
        sidebarItems={sidebarItems}
        username={username}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />
    );
  } else {
    return <SidebarMobile sidebarItems={sidebarItems} username={username} />;
  }
}
