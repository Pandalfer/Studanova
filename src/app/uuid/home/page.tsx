import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

interface Props {
  params: {
    uuid: string;
  };
}

export default async function HomePage({ params }: Props) {
  const user = await prisma.student.findUnique({
    where: {
      id: params.uuid,
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="bg-red-500 w-full min-h-screen">
      <h1 className="text-white text-3xl font-bold p-4">
        Welcome back, {user.username}!
      </h1>
      {/* Add your components here */}
    </div>
  );
}
