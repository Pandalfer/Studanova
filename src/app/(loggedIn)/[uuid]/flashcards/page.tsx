"use client";
import * as React from "react";
import { use } from "react";
import { FlashcardsManager } from "@/components/Flashcards/flashcard-manager";

export default function FlashcardsHomePage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);

  return <FlashcardsManager uuid={uuid} isDemo={false} />;
}
