type BentoCardProps = {
  col: number;
  row: number;
  title: string;
  icon: string;
  description: string;
};

export default function BentoCard({
  col,
  row,
  title,
  icon,
  description,
}: BentoCardProps) {
  const colSpan: { [key: string]: string } = {
    "1": "lg:col-span-1",
    "2": "lg:col-span-2",
    "3": "lg:col-span-3",
    "4": "lg:col-span-4",
  };

  const rowSpan: { [key: string]: string } = {
    "1": "lg:row-span-1",
    "2": "lg:row-span-2",
    "3": "lg:row-span-3",
  };

  return (
    <div
      className={`rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl card-dark ${colSpan[col.toString()]} ${rowSpan[row.toString()]}`}
    >
      <div className="text-3xl">{icon}</div>
      <div className="mt-4 font-semibold text-xl">{title}</div>
      <p className="mt-1 text-sm text-white/80">{description}</p>
    </div>
  );
}
