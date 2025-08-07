import PrimaryActionButton from "@/components/PrimaryActionButton";

export default function CTANOTES() {
  return (
    <section className="py-16">
      <div className="flex justify-center px-5">
        <div className="flex flex-col gap-8 text-center max-w-3xl w-full">
          <span
            className="material-symbols-outlined text-main-dark mx-auto"
            style={{ fontSize: "100px" }}
            aria-hidden="true"
          >
            edit_document
          </span>
          <h1 className="text-5xl w-1/2 mx-auto md:text-6xl font-extrabold text-main-dark">
            Smart Notes made Simple
          </h1>
          <p className="text-main-dark text-xl md:text-2xl leading-relaxed">
            Boost productivity with our powerful, easy-to-use notes app —
            designed for students like you.
          </p>
          <PrimaryActionButton
            text="Get Studaro Notes Free"
            className="self-center rounded-2xl px-8 py-4 text-lg"
          />
        </div>
      </div>
    </section>
  );
}
