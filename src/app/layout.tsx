// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Studaro",
  description: "The best productivity tool for students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </head>
      <body className="bg-dark">
        {/* You can keep your Navbar component here if you want */}
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
