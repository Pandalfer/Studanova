import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/Navigation/navbar";

export default function NotFound() {
  return (
    <>
      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center h-screen">
        <h1 className="md:text-[13rem] text-9xl font-bold">404</h1>
        <p className="max-w-xs md:max-w-md md:text-lg text-md text-center mb-8">
          Oops! We could not find this page in the textbook. The page you were
          looking for does not exist, is unavailable, or failed to load.
        </p>
        <Button>
          <Link href={"/"}>Go back home</Link>
        </Button>
      </div>
    </>
  );
}
