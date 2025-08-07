import Link from "next/link";

export default function NavigationTitle({
  title,
  className,
  destination,
}: {
  title: string;
  className?: string;
  destination?: string;
}) {
  const href = "/" + (destination ?? "");

  return (
    <Link href={href}>
      <div
        className={
          "flex flex-col items-start w-fit group cursor-pointer " +
          (className ?? "")
        }
      >
        <h2 className="text-main-dark">{title}</h2>
        <span
          className="
            block h-[2px] mt-1 w-full
            bg-transparent translate-y-0
            transition-all duration-300 ease-in-out
            group-hover:-translate-y-[5px] group-hover:bg-underline
          "
        />
      </div>
    </Link>
  );
}
