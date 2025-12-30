"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import PrimaryActionButton from "@/components/primary-action-button";
import { toast } from "sonner";
import {loadDemoFolders, loadDemoNotes} from "@/lib/notes/note-storage";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [strengthColor, setStrengthColor] = useState("white");
  const router = useRouter();

  function getBorderColorClass(color: string) {
    switch (color) {
      case "red":
        return "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50";
      case "orange":
        return "border-orange-500 focus-visible:border-orange-500 focus-visible:ring-orange-500/50";
      case "yellow":
        return "border-yellow-400 focus-visible:border-yellow-400 focus-visible:ring-yellow-400/50";
      case "lightgreen":
        return "border-green-400 focus-visible:border-green-400 focus-visible:ring-green-400/50";
      case "green":
        return "border-green-600 focus-visible:border-green-600 focus-visible:ring-green-600/50";
      default:
        return "border-border"; // default border class
    }
  }

  function checkPassword(pwd: string) {
    let strength: string;
    let color: string;

    if (pwd.length < 6) {
      strength = "Too Short";
      color = "red";
    } else if (pwd.length < 8) {
      strength = "Weak";
      color = "orange";
    } else if (/^[a-zA-Z]+$/.test(pwd)) {
      strength = "Medium (Try adding numbers or symbols)";
      color = "yellow";
    } else if (/^[a-zA-Z0-9]+$/.test(pwd)) {
      strength = "Strong (Add symbols for extra security)";
      color = "lightgreen";
    } else {
      strength = "Very Strong";
      color = "green";
    }

    setPasswordStrength(strength);
    setStrengthColor(color);
  }

  async function OnSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !(
        passwordStrength === "Strong (Add symbols for extra security)" ||
        passwordStrength === "Very Strong"
      )
    ) {
      toast.error("Please choose a stronger password before signing up.");
      return;
    }

    const demoNotes = loadDemoNotes();
    const demoFolders = loadDemoFolders();

    const response = await fetch("/api/user/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        notes: demoNotes,
        folders: demoFolders,
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
        <div className={"bg-card rounded-2xl shadow-xl p-8 space-y-6"}>
          <div className={"text-center space-y-2"}>
            <h1
              className={"text-3xl font-bold tracking-tighter text-foreground"}
            >
              Welcome
            </h1>
            <p className={"text-muted"}>
              Enter your credentials to access your account
            </p>
          </div>
          <form className={"space-y-4"} onSubmit={OnSubmit}>
            <div className={"space-y-3 text-muted-foreground"}>
              <Label htmlFor="username">Username</Label>
              <Input
                id={"username"}
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                className={"border-border"}
                placeholder={"John Doe"}
                value={username}
                required
              />
            </div>
            <div className={"space-y-3 text-muted-foreground"}>
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
            <div className={"space-y-3 text-muted-foreground"}>
              <Label htmlFor="password">Password</Label>
              <div className={"relative"}>
                <Input
                  id={"password"}
                  value={password}
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    checkPassword(e.target.value);
                  }}
                  className={`border-border ${getBorderColorClass(strengthColor)}`}
                  required
                />
                <button
                  type={"button"}
                  onClick={() => setShowPassword(!showPassword)}
                  className={
                    "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted cursor-pointer"
                  }
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {password && (
                <p
                  style={{ color: strengthColor }}
                  className="mt-2 font-semibold text-center"
                >
                  Password strength: {passwordStrength}
                </p>
              )}
            </div>
            <div className={"flex items-center justify-between"}>
              <div className={"flex items-center space-x-2"}>
                <Checkbox id="remember" className={"cursor-pointer"} />
                <Label
                  htmlFor={"remember"}
                  className={"cursor-pointer text-muted-foreground"}
                >
                  Remember Me
                </Label>
              </div>
              <a
                href={"/sign-in"}
                className={"text-muted-foreground hover:underline text-sm"}
              >
                Or sign in instead
              </a>
            </div>
            <PrimaryActionButton
              text={"Sign Up"}
              className={"w-full rounded-2xl "}
              type={"submit"}
            />
          </form>
          {/*<div className={"relative"}>*/}
          {/*  <div className={"absolute inset-0 flex items-center"}>*/}
          {/*    <span className={"w-full border-t border-muted"}></span>*/}
          {/*  </div>*/}
          {/*  <div className={"relative flex justify-center text-xs uppercase"}>*/}
          {/*    <span className={"bg-card px-2 text-muted"}>*/}
          {/*      Or continue with*/}
          {/*    </span>*/}
          {/*  </div>*/}
          {/*</div>*/}
          {/*<div className={"grid grid-cols-2 gap-4"}>*/}
          {/*  <Button*/}
          {/*    variant={"outline"}*/}
          {/*    className={"w-full border-primary text-primary bg-primary"}*/}
          {/*  >*/}
          {/*    <Github className={"mr-2 h-4 w-4"} />*/}
          {/*    Github*/}
          {/*  </Button>*/}
          {/*  <Button*/}
          {/*    variant={"outline"}*/}
          {/*    className={"w-full border-primary text-primary bg-primary"}*/}
          {/*  >*/}
          {/*    <Mail className={"mr-2 h-4 w-4"} />*/}
          {/*    Google*/}
          {/*  </Button>*/}
          {/*</div>*/}
        </div>
      </motion.div>
    </div>
  );
}
