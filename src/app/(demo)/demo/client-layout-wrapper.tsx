"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Navigation/Sidebar/sidebar";
import clsx from "clsx";
import { usePathname } from "next/navigation";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export function ClientLayoutWrapper({
  children,
}: ClientLayoutWrapperProps) {
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <>
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isDemo
      />
      <main
        className={clsx(
          "transition-all duration-300 ease-in-out overflow-y-auto",
          isCollapsed ? "sm:ml-[60px]" : "sm:ml-[270px]",
          pathname === "/demo/notes" ? "mr-[320px]" : "mr-0",
        )}
      >
        {children}
      </main>
    </>
  );
}
