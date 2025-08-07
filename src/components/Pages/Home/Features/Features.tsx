"use client";

import { useRef, useState, useEffect } from "react";
import BentoCard from "@/components/Pages/Home/Features/BentoCard";

export default function Features() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position
  const updateScrollButtons = () => {
    const container = carouselRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft + container.offsetWidth <
          container.scrollWidth - 1,
      );
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const container = carouselRef.current;
    if (!container) return;
    container.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  const scrollByAmount = 300;

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({
      left: -scrollByAmount,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: scrollByAmount, behavior: "smooth" });
  };

  return (
    <section className="w-full px-4 py-16 flex justify-center">
      <div className="w-full max-w-7xl">
        {/* Mobile Carousel with Arrows */}
        <div className="relative sm:hidden">
          {/* Arrows */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full shadow flex justify-center items-center transition-opacity ${
              canScrollLeft ? "opacity-100" : "opacity-30 pointer-events-none"
            }`}
          >
            <span className="material-symbols-outlined relative left-[4px]">
              arrow_back_ios
            </span>
          </button>
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full shadow flex justify-center items-center transition-opacity ${
              canScrollRight ? "opacity-100" : "opacity-30 pointer-events-none"
            }`}
          >
            <span className="material-symbols-outlined">arrow_forward_ios</span>
          </button>

          {/* Scrollable container */}
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scroll-smooth"
          >
            {cards.map((card, index) => (
              <div
                key={index}
                className="min-w-[250px] snap-start flex-shrink-0"
              >
                <BentoCard {...card} />
              </div>
            ))}
          </div>
        </div>

        {/* Grid on sm+ */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(150px,_1fr)] gap-4">
          {cards.map((card, index) => (
            <BentoCard key={index} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

const cards = [
  {
    col: 1,
    row: 1,
    icon: "📝",
    title: "Smart Notes",
    description: "Take and organise notes with folders, tags, and rich text.",
  },
  {
    col: 1,
    row: 1,
    icon: "✅",
    title: "Task & Homework Manager",
    description: "Stay on top of assignments with reminders and priorities.",
  },
  {
    col: 2,
    row: 1,
    icon: "📅",
    title: "Timetable Planner",
    description: "Build your weekly schedule with a visual planner.",
  },
  {
    col: 1,
    row: 1,
    icon: "🧠",
    title: "Flashcards",
    description: "Use spaced repetition to study smarter.",
  },
  {
    col: 2,
    row: 1,
    icon: "⏱",
    title: "Pomodoro Timer",
    description: "Stay focused with sessions and breaks.",
  },
  {
    col: 1,
    row: 1,
    icon: "📈",
    title: "GPA Tracker",
    description: "Track and calculate your grades.",
  },
  {
    col: 2,
    row: 1,
    icon: "📂",
    title: "Topic Organisation",
    description: "Sort work by subject, module, or exam board.",
  },
  {
    col: 1,
    row: 1,
    icon: "🔗",
    title: "Cloud Sync",
    description: "Autosave your work across devices.",
  },
  {
    col: 1,
    row: 1,
    icon: "🎯",
    title: "Distraction-Free Design",
    description: "Minimal UI with focus and dark mode.",
  },
];
