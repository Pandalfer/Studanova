export default function SecondaryActionButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <button
      className={
        "inline-block w-fit px-5 py-3 rounded bg-secondary border border-secondary text-secondary sm:text-lg max-w-md mx-auto lg:mx-0 cursor-pointer transition-colors duration-300 " +
        className
      }
    >
      {text}
    </button>
  );
}
