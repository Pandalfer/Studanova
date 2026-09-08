import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DemoHomePage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-0.75rem)]">
      <div className="text-center p-8">
        <p className="text-muted-foreground mb-4">
          You are not logged in. To access all features create an account:
        </p>
        <Link href={"/sign-up"}>
          <Button>Sign up</Button>
        </Link>
      </div>
    </div>
  );
}
