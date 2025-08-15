// src/app/layout.tsx
import "../globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navigation/Navbar";
import Footer from "@/components/Navigation/Footer";
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
        <Navbar />
        {children}
        <Toaster richColors position="top-center" />
        <Footer />
      </body>
    </html>
  );
}
