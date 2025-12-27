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

// Renamed to NestedLayout to reflect its purpose
export default function NestedLayout({
                                       children,
                                     }: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Toaster richColors position="top-center" />
      <Footer />
    </>
  );
}