import "../../globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { ClientLayoutWrapper } from "./client-layout-wrapper";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ uuid: string }>; // params is a Promise now
}

export const metadata: Metadata = {
  title: "Studanova",
  description: "The best productivity tool for students",
};

export default async function RootLayout({ children, params }: LayoutProps) {
  const { uuid } = await params; // await params here

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </head>
      <body className="dark">
        <ClientLayoutWrapper uuid={uuid}>{children}</ClientLayoutWrapper>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
