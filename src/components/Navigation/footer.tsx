import NavigationTitle from "@/components/Navigation/navigation-title";
import Logo from "@/components/logo";

export default function Footer() {
  return (
    <section className="w-full mb-10">
      <hr className="border-0 h-[1px] max-w-6xl mx-auto bg-card" />
      <footer className="mt-10 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          {/* Left: Logo and Description */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="flex justify-center lg:justify-start items-center">
              <Logo size={40} />
            </div>

            <p className="text-foreground text-base md:text-lg leading-relaxed text-center lg:text-left">
              Join thousands of students who organize their lives better with
              Studanova.
            </p>
          </div>

          <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="flex flex-wrap gap-6 justify-center lg:justify-end">
              <NavigationTitle title="Notes" destination={"notes"} />
              {/*<NavigationTitle title="Tasks" destination={"tasks"} />*/}
              {/*<NavigationTitle title="Tools" destination={"tools"} />*/}
            </div>
            <p className="text-muted-foreground text-sm text-center lg:text-right mt-6">
              © 2025 Studanova. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </section>
  );
}
