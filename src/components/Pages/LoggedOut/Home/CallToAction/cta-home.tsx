import PrimaryActionButton from "@/components/primary-action-button";
import Link from "next/link";

export default function CTAHOME() {
  return (
    <section className="max-w-4xl mx-auto px-6 mt-24 text-center">
      <div className="flex flex-col items-center">
        <h1 className="text-foreground text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
          🎓 Study smarter, not harder with Studanova.
        </h1>

        <p className="text-muted-foreground mt-6 text-base sm:text-lg max-w-2xl leading-relaxed">
          Your all-in-one student dashboard. Organise your notes, stay on top
          of deadlines, and boost productivity with tools built just for
          students.
        </p>

        <div className="mt-8">
          <Link href="/demo/notes">
            <PrimaryActionButton text="Try the Free Demo" />
          </Link>
        </div>
      </div>

      <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-12 text-sm sm:text-base">
        Perfect for GCSE, A-Level, and Uni students who want to stay organised
        and productive without the overwhelm.
      </p>
    </section>
  );
}
