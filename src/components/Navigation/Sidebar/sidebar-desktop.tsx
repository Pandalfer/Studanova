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
import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarDesktopProps {
  sidebarItems: SidebarItems;
  username: string;
  isCollapsed: boolean;
  onToggle: () => void;
  isDemo?: boolean;
}

export function SidebarDesktop({
  sidebarItems,
  username,
  isCollapsed,
  onToggle,
  isDemo = false,
}: SidebarDesktopProps) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "h-screen fixed left-0 top-0 z-40 border-r bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[60px]" : "w-[270px]",
      )}
    >
      <div className="h-full px-3 py-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center">
          {!isCollapsed && (
            <h3
              className={clsx(
                "mx-3 text-lg font-semibold text-foreground transition-all duration-300 ease-in-out",
                isCollapsed
                  ? "opacity-0 translate-x-[-20px] pointer-events-none"
                  : "opacity-100 translate-x-0",
              )}
            >
              Studanova
            </h3>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onToggle}>
                {isCollapsed ? <Library size={24} /> : <X size={20} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isCollapsed ? "Open Sidebar" : "Close Sidebar"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="mt-5 flex flex-col gap-1 w-full flex-1">
          {sidebarItems.links.map((link, index) => (
            <Link key={index} href={link.href}>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarButton
                      icon={link.icon}
                      collapsed={isCollapsed}
                      className="w-full"
                      variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                    >
                      {link.label}
                    </SidebarButton>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>
                      {String(link.label).charAt(0).toUpperCase() +
                        String(link.label).slice(1)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <SidebarButton
                  icon={link.icon}
                  collapsed={isCollapsed}
                  className="w-full"
                  variant={pathname === link.href ? "secondary" : "ghost"}
                >
                  {link.label}
                </SidebarButton>
              )}
            </Link>
          ))}

          {!isCollapsed && sidebarItems.extras}
        </div>

        <div className="absolute left-0 bottom-3 w-full px-3">
          {!isCollapsed && (
            <Separator className="absolute -top-3 left-0 w-full" />
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={clsx(
                  "w-full flex items-center",
                  isCollapsed ? "justify-center" : "justify-between",
                )}
              >
                <div className="flex gap-2 items-center">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{username[0] ?? "U"}</AvatarFallback>
                  </Avatar>
                  {!isCollapsed && <span>{username}</span>}
                </div>
                {!isCollapsed && <MoreHorizontal size={20} />}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={clsx(
                "mb-2 w-56 p-3 rounded-[1rem]",
                isCollapsed ? "w-40" : "w-56",
              )}
            >
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
