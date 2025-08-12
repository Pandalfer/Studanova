"use client";
import { useState } from "react";

import NavigationTitle from "@/components/Navigation/NavigationTitle";
import Logo from "@/components/Logo";
import PrimaryActionButton from "@/components/PrimaryActionButton";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => {
    setOpen(!open);
  };

  return (
    <>
      <div className="sticky top-0 z-40 flex justify-center p-3 bg-background">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Left */}
          <div className="flex-shrink-0">
            <Logo size={40} />
          </div>

          {/* Middle */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 gap-20">
            <NavigationTitle title="Notes" destination="notes" />
            <NavigationTitle title="Tasks" destination={"tasks"} />
            <NavigationTitle title="Tools" destination={"tools"} />
          </div>

          {/* Right */}
          <div className="hidden md:flex flex-shrink-0 flex-row gap-7 items-center">
            <NavigationTitle title="Log In" destination="sign-in" />
            <Link href={"/sign-up"}>
              <PrimaryActionButton text="Sign Up" destination="" />
            </Link>
          </div>

          {/* Hamburger */}
          <div className="visible md:hidden">
            <span
              className="material-symbols-outlined transition-transform duration-300 ease-in-out cursor-pointer text-3xl text-foreground"
              onClick={toggleMenu}
            >
              menu
            </span>
          </div>
        </div>
      </div>

      {/* Hamburger menu */}
      <div
        className={`fixed inset-0 z-50 bg-gradient-to-b from-black/70 to-black/50 transition-opacity ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Slide-in Menu */}
        <div
          className={`absolute top-0 right-0 h-full w-3/4 sm:w-1/2 bg-background text-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Close Button */}
          <button
            onClick={toggleMenu}
            className="absolute top-5 right-5 text-3xl text-muted hover:text-white tranisiton duration-300 cursor-pointer"
          >
            &times;
          </button>

          {/* Navigation Links */}
          <div className="flex flex-col mt-20 space-y-6 items-center text-lg font-medium">
            <NavigationTitle
              title="Notes"
              className="text-lg"
              destination="notes"
            />
            <NavigationTitle
              title="Tasks"
              className="text-lg"
              destination={"tasks"}
            />
            <NavigationTitle
              title="Tools"
              className="text-lg"
              destination={"tools"}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center mt-10 space-y-3 px-6">
            <NavigationTitle
              title="Log In"
              className="text-base"
              destination="sign-in"
            />
            <Link href={"/sign-up"}>
              <PrimaryActionButton text="Sign Up" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
