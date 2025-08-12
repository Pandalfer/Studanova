import PrimaryActionButton from "@/components/PrimaryActionButton";
import Link from "next/link";

export default function CTA({
  icon,
  title,
  description,
  buttonText,
}: {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
}) {
  return (
    <section className="py-16">
      <div className="flex justify-center px-5">
        <div className="flex flex-col gap-8 text-center max-w-3xl w-full">
          <span
            className="material-symbols-outlined text-foreground mx-auto"
            style={{ fontSize: "100px" }}
            aria-hidden="true"
          >
            {icon}
          </span>

          <h1 className="text-5xl w-1/2 mx-auto md:text-6xl font-extrabold text-foreground">
            {title}
          </h1>
          <p className="text-foreground text-xl md:text-2xl leading-relaxed">
            {description}
          </p>
          <Link href={"/demo/notes"}>
            <PrimaryActionButton
              text={buttonText}
              className="self-center rounded-2xl px-8 py-4 text-lg"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
