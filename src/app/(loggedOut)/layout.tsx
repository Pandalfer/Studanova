// src/app/layout.tsx
import "../globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navigation/navbar";
import Footer from "@/components/Navigation/footer";
import React from "react";

export const metadata: Metadata = {
  title: "Studanova",
  description: "The best productivity tool for students",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
    <head>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
      />
    </head>
    <body className="dark">
    <Navbar />
    {children}
    <Toaster richColors position="top-center" />
    <Footer />
    </body>
    </html>
  );
}
