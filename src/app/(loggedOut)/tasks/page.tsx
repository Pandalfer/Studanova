import CTA from "@/components/Pages/LoggedOut/CTA";

export default function Tasks() {
  return (
    <div>
      <CTA
        icon={"assignment"}
        title={"Stay on Top of Every Task"}
        description={
          "Organize assignments, deadlines, and to-dos in one smart, simple dashboard —\n" +
          "built to help students manage their time and achieve their goals."
        }
        buttonText={"Get Studanova Tasks Free"}
      />
    </div>
  );
}
