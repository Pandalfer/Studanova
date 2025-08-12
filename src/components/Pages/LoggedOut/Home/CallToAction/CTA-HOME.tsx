import PrimaryActionButton from "@/components/PrimaryActionButton";
import Link from "next/link";

export default function CTAHOME() {
  return (
    <section className="flex flex-col items-center max-w-7xl mx-auto px-6 mt-24 gap-12">
      {/* CTA Content */}
      <div className="flex flex-col lg:flex-row items-center w-full gap-12">
        {/* Text Content */}
        <div className="flex flex-col flex-1 text-center lg:text-left">
          <h1 className="text-foreground text-4xl sm:text-5xl font-bold leading-tight">
            🎓 Study smarter, not harder with Studanova.
          </h1>
          <p className="text-muted-foreground mt-6 text-base sm:text-lg max-w-md mx-auto lg:mx-0">
            Your all-in-one student dashboard. Organise your notes, stay on top
            of deadlines, and boost productivity with tools built just for
            students.
          </p>
          <div className="inline-flex gap-4 mt-8 self-center lg:self-start">
            <Link href={"/demo/home"}>
              <PrimaryActionButton text="Try it Free" />
            </Link>
          </div>
        </div>

        {/* Image - Only visible on lg+ screens */}
        <div className="hidden lg:flex flex-1 justify-center">
          <div className="bg-black rounded-xl p-6 text-left w-full max-w-2xl font-mono text-sm leading-relaxed text-white shadow-md">
            <p>PUT SMTH COOL HERE</p>
            <div className="mt-2 h-1 w-8 bg-white animate-pulse rounded" />
          </div>
        </div>
      </div>

      <p className="text-center text-muted-foreground max-w-2xl">
        “Perfect for GCSE, A-Level, and Uni students who want to stay organised
        and productive without the overwhelm.”
      </p>
    </section>
  );
}
