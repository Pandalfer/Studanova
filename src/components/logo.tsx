import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Logo({ size }: { size: number }) {
  return (
    <Link
      href="/"
      className="inline-block"
      style={{ width: size, height: size }}
      aria-label="Home"
    >
      <Tooltip>
        <TooltipTrigger>
          <Image
            className="cursor-pointer"
            width={size}
            height={size}
            quality={100}
            src="/Logo.svg"
            alt="Logo"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Studanova Logo</p>
        </TooltipContent>
      </Tooltip>
    </Link>
  );
}
