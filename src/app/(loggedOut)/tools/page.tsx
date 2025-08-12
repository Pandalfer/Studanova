import CTA from "@/components/Pages/LoggedOut/CTA";

export default function Tools() {
  return (
    <div>
      <CTA
        icon={"design_services"}
        title={"Your All-in-One Student Toolbox"}
        description={
          "Use helpful tools made for students — including flashcards, a Pomodoro focus timer,\n" +
          "a grade calculator, and an easy citation generator — all in one place."
        }
        buttonText={"Explore Tools"}
      />
    </div>
  );
}
