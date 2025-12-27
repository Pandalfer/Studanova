"use client";

import { SidebarItems } from "@/lib/types";
import { Sheet, SheetClose, SheetHeader } from "@/components/ui/sheet";
import { SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, MoreHorizontal, Settings, X } from "lucide-react";
import Link from "next/link";
import { SidebarButton } from "@/components/Navigation/Sidebar/sidebar-button";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

interface SidebarMobileProps {
  sidebarItems: SidebarItems;
  username: string; // add username prop
}

export function SidebarMobile({ sidebarItems, username }: SidebarMobileProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="fixed top-3 left-3 z-50"
        >
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side={"left"} hideClose className={"px-3 py-4"}>
        <SheetHeader
          className={"flex flex-row justify-between items-center space-y-0"}
        >
          <span className={"text-lg font-semibold text-foreground mx-3"}>
            Studanova
          </span>
          <SheetClose asChild>
            <Button variant={"ghost"} className={"h-7 w-7 p-0"}>
              <X size={15} />
            </Button>
          </SheetClose>
        </SheetHeader>
        <div className={"h-full"}>
          <div className={"mt-5 flex flex-col w-full gap-1"}>
            {sidebarItems.links.map((link, index) => (
              <Link key={index} href={link.href}>
                <SidebarButton
                  icon={link.icon}
                  className="w-full"
                  variant={
                    pathname.startsWith(link.href) ? "secondary" : "ghost"
                  }
                >
                  {link.label}
                </SidebarButton>
              </Link>
            ))}
            {sidebarItems.extras}
          </div>
          <div className={"absolute w-full bottom-4 px-1 left-0"}>
            <Separator className={"absolute -top-3 left-0 w-full"} />
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant={"ghost"}
                  className={"w-full flex justify-between items-center"}
                >
                  <div className={"flex gap-2 items-center"}>
                    <Avatar className={"h-5 w-5"}>
                      <AvatarFallback>{username[0] ?? "U"}</AvatarFallback>
                    </Avatar>
                    <span>{username}</span>
                  </div>
                  <MoreHorizontal size={20} />
                </Button>
              </DrawerTrigger>
              <DrawerContent className={"mb-2 p-2"}>
                <div className="flex flex-col space-y-2 mt-2">
                  <Link href={"/public"}>
                    <SidebarButton size="sm" icon={Settings} className="w-full">
                      Account Settings
                    </SidebarButton>
                  </Link>
                  <Link href={"/sign-in"}>
                    <SidebarButton size="sm" icon={LogOut} className="w-full">
                      Log Out
                    </SidebarButton>
                  </Link>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
