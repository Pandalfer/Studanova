import "../../globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { ClientLayoutWrapper } from "./client-layout-wrapper";
import { Roboto } from "next/font/google";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Studanova",
  description: "The best productivity tool for students",
};

interface LayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className={roboto.className}>
      <body className="dark overflow-y-hidden">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
