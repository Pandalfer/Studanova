import Image from "next/image";
import Link from "next/link";

export default function Logo({ size }: { size: number }) {
  return (
    <Link
      href="/"
      className="inline-block"
      style={{ width: size, height: size }}
      aria-label="Home"
    >
      <Image
        className="cursor-pointer"
        width={size}
        height={size}
        quality={100}
        src="/Logo.svg"
        alt="Logo"
      />
    </Link>
  );
}
