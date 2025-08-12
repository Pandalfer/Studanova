import CTA from "@/components/Pages/LoggedOut/CTA";

export default function Notes() {
  return (
    <div>
      <CTA
        icon={"edit_document"}
        title={"Smart Notes made Simple"}
        description={
          "Boost productivity with our powerful, easy-to-use notes app —\n" +
          "designed for students like you."
        }
        buttonText={"Get Studanova Notes Free"}
      />
    </div>
  );
}
