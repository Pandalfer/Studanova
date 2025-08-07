"use client";

import clsx from "clsx";

type ButtonType = "button" | "submit" | "reset";

type Props = {
  text: string;
  className?: string;
  destination?: string;
  type?: ButtonType;
};

export default function PrimaryActionButton({
  text,
  className,
  type = "button",
}: Props) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-block w-fit px-5 py-3 rounded bg-primary border border-primary text-primary sm:text-lg max-w-md mx-auto lg:mx-0 cursor-pointer transition-colors duration-300",
        className,
      )}
    >
      {text}
    </button>
  );
}
