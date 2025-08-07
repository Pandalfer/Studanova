"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Github, Mail } from "lucide-react";
import PrimaryActionButton from "@/components/PrimaryActionButton";
import { toast } from "sonner";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function OnSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("/api/user/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    if (response.ok) {
      const user = await response.json();
      router.push(`/${user.id}/home`);
    } else {
      const errorData = await response.json();
      toast.error(
        `Account creation failed: ${errorData?.error || "Unknown error"}`,
      );
    }
  }

  return (
    <div className={"min-h-screen flex items-center justify-center p-4 "}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={"w-full max-w-md"}
      >
        <div className={"card-dark rounded-2xl shadow-xl p-8 space-y-6"}>
          <div className={"text-center space-y-2"}>
            <h1
              className={"text-3xl font-bold tracking-tighter text-main-dark"}
            >
              Welcome
            </h1>
            <p className={"text-muted-dark"}>
              Enter your credentials to access your account
            </p>
          </div>
          <form className={"space-y-4"} onSubmit={OnSubmit}>
            <div className={"space-y-3 text-body-dark"}>
              <Label htmlFor="username">Username</Label>
              <Input
                id={"username"}
                type="username"
                onChange={(e) => setUsername(e.target.value)}
                className={"border-border"}
                placeholder={"John Doe"}
                value={username}
              />
            </div>
            <div className={"space-y-3 text-body-dark"}>
              <Label htmlFor="email">Email</Label>
              <Input
                id={"email"}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                className={"border-border"}
                placeholder={"test@gmail.com"}
                value={email}
                required
              />
            </div>
            <div className={"space-y-3 text-body-dark"}>
              <Label htmlFor="password">Password</Label>
              <div className={"relative"}>
                <Input
                  id={"password"}
                  value={password}
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => setPassword(e.target.value)}
                  className={"border-border"}
                  required
                />
                <button
                  type={"button"}
                  onClick={() => setShowPassword(!showPassword)}
                  className={
                    "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-dark hover:text-body-dark cursor-pointer"
                  }
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className={"flex items-center justify-between"}>
              <div className={"flex items-center space-x-2"}>
                <Checkbox
                  id="remember"
                  className="cursor-pointer border-border hover:text-primary text-primary
             data-[state=checked]:bg-[#424D1B] data-[state=checked]:border-[#424D1B] hover:data-[state=unchecked]:bg-[#1f1f1f];"
                />
                <Label
                  htmlFor={"remember"}
                  className={"cursor-pointer text-body-dark"}
                >
                  Remember Me
                </Label>
              </div>
            </div>
            <PrimaryActionButton
              text={"Sign Up"}
              className={"w-full rounded-2xl "}
              type={"submit"}
            />
          </form>
          <div className={"relative"}>
            <div className={"absolute inset-0 flex items-center"}>
              <span className={"w-full border-t border-muted-dark"}></span>
            </div>
            <div className={"relative flex justify-center text-xs uppercase"}>
              <span className={"card-dark px-2 text-muted-dark"}>
                Or continue with
              </span>
            </div>
          </div>
          <div className={"grid grid-cols-2 gap-4"}>
            <Button
              variant={"outline"}
              className={"w-full border-primary text-primary bg-primary"}
            >
              <Github className={"mr-2 h-4 w-4"} />
              Github
            </Button>
            <Button
              variant={"outline"}
              className={"w-full border-primary text-primary bg-primary"}
            >
              <Mail className={"mr-2 h-4 w-4"} />
              Google
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
