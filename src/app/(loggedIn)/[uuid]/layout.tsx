import "../../globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { ClientLayoutWrapper } from "./client-layout-wrapper";

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
    <html lang="en">
      <body className="dark">
        <ClientLayoutWrapper uuid={uuid}>{children}</ClientLayoutWrapper>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
