import Image from "next/image";
import Link from "next/link";

export default function Logo({ size }: { size: number }) {
  return (
    <Link href={"/"}>
      <Image
        className={"cursor-pointer"}
        width={size}
        height={size}
        quality={100}
        src="/logo.svg"
        alt="Logo"
      />
    </Link>
  );
}
