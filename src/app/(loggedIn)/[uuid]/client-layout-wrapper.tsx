"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Navigation/Sidebar/sidebar";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import {useMediaQuery} from "usehooks-ts";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  uuid: string;
}

export function ClientLayoutWrapper({
  children,
  uuid,
}: ClientLayoutWrapperProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)", {
    initializeWithValue: false,
  });

  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <>
      <Sidebar
        uuid={uuid}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main
        className={clsx(
          "transition-all duration-300 ease-in-out overflow-y-auto",
          isCollapsed ? "sm:ml-[60px]" : "sm:ml-[270px]",
          pathname.includes("notes") && isDesktop ? "mr-[320px]" : "mr-0",
        )}
      >
        {children}
      </main>
    </>
  );
}
