"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Navigation/Sidebar/sidebar";
import clsx from "clsx";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  uuid: string;
}

export function ClientLayoutWrapper({
  children,
  uuid,
}: ClientLayoutWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <>
      <Sidebar
        uuid={uuid}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isDemo
      />
      <main
        className={clsx(
          "mx-5 mt-16 sm:mt-3 transition-all duration-300 ease-in-out",
          isCollapsed ? "sm:ml-[80px]" : "sm:ml-[300px]",
        )}
      >
        {children}
      </main>
    </>
  );
}
