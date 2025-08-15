import "../globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import Logo from "@/components/Logo";
import React from "react";

export const metadata: Metadata = {
  title: "Studanova",
  description: "The best productivity tool for students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="dark">
        <div className="fixed top-0 left-0 z-50 w-full p-4">
          <Logo size={50} />
        </div>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
