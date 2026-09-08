"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import PrimaryActionButton from "@/components/primary-action-button";
import { toast } from "sonner";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function OnSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/user/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (response.ok) {
      const user = await response.json();
      router.push(`/${user.id}/home`);
    } else {
      const errorData = await response.json();
      toast.error(`Sign in failed: ${errorData?.error || "Unknown error"}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter text-foreground">
              Welcome Back
            </h1>
            <p className="text-muted">
              Enter your username and password to sign in
            </p>
          </div>
          <form className="space-y-4" onSubmit={OnSubmit}>
            <div className="space-y-3 text-muted-foreground">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                className="border-border"
                placeholder="JohnDoe"
                value={username}
                required
              />
            </div>
            <div className="space-y-3 text-muted-foreground">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  value={password}
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <PrimaryActionButton
              text="Sign In"
              className="w-full rounded-2xl"
              type="submit"
            />
          </form>
          <div className={"relative"}>
            <div className={"relative flex justify-center text-xs uppercase"}>
              <a
                href={"/sign-up"}
                className={"text-muted-foreground px-2 hover:underline text-sm"}
              >
                Or sign up instead
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
