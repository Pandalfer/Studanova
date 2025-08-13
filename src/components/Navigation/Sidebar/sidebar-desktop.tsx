"use client";

import { SidebarButton } from "@/components/Navigation/Sidebar/sidebar-button";
import { LogOut, MoreHorizontal, Settings, Library, X } from "lucide-react";
import { SidebarItems } from "@/types";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";

interface SidebarDesktopProps {
  sidebarItems: SidebarItems;
  username: string;
  isCollapsed: boolean;
  onToggle: () => void;
  isDemo?: boolean; // Optional prop for demo mode
}

export function SidebarDesktop({
  sidebarItems,
  username,
  isCollapsed,
  onToggle,
  isDemo = false, // Default to false if not provided
}: SidebarDesktopProps) {
  const pathname = usePathname();

  // Collapsed View
  if (isCollapsed) {
    return (
      <aside className="w-[60px] h-screen fixed left-0 top-0 z-40 border-r flex flex-col items-center py-4">
        <Button variant="ghost" size="icon" className="mb-4" onClick={onToggle}>
          <Library size={24} />
        </Button>
      </aside>
    );
  }

  // Expanded View
  return (
    <aside className="w-[270px] max-w-xs h-screen fixed left-0 top-0 z-40 border-r">
      <div className="h-full px-3 py-4">
        <div className="flex justify-between items-center">
          <h3 className="mx-3 text-lg font-semibold text-foreground">
            Studanova
          </h3>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <X size={20} />
          </Button>
        </div>

        <div className="mt-5 flex flex-col gap-1 w-full">
          {sidebarItems.links.map((link, index) => (
            <Link key={index} href={link.href}>
              <SidebarButton
                icon={link.icon}
                className="w-full"
                variant={pathname === link.href ? "secondary" : "ghost"}
              >
                {link.label}
              </SidebarButton>
            </Link>
          ))}

          {sidebarItems.extras}
        </div>

        <div className="absolute left-0 bottom-3 w-full px-3">
          <Separator className="absolute -top-3 left-0 w-full" />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center"
              >
                <div className="flex gap-2 items-center">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback>{username[0] ?? "U"}</AvatarFallback>
                  </Avatar>
                  <span>{username}</span>
                </div>
                <MoreHorizontal size={20} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="mb-2 w-56 p-3 rounded-[1rem]">
              <div className="flex flex-col space-y-1">
                {!isDemo && (
                  <Link href={"/public"}>
                    <SidebarButton size="sm" icon={Settings} className="w-full">
                      Account Settings
                    </SidebarButton>
                  </Link>
                )}

                <Link href={"/sign-in"}>
                  <SidebarButton size="sm" icon={LogOut} className="w-full">
                    Log Out
                  </SidebarButton>
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </aside>
  );
}
