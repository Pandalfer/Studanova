import "../../globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { ClientLayoutWrapper } from "./client-layout-wrapper";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ uuid: string }>;
}

export const metadata: Metadata = {
  title: "Studanova",
  description: "The best productivity tool for students",
};

export default async function RootLayout({ children, params }: LayoutProps) {
  const { uuid } = await params;

  return (
  <>
    <ClientLayoutWrapper uuid={uuid}>
      <ScrollArea className="h-screen">{children}</ScrollArea>
    </ClientLayoutWrapper>
    <Toaster richColors position="top-center" />
  </>
  );
}
