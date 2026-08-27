"use client";

import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type FormEvent, type ReactNode, useState } from "react";
import {
  type ButtonState,
  StatefulButton,
} from "#components/motion/button/stateful";
import { EASE_OUT } from "#lib/ease";
import { cn } from "#lib/utils";
import { Silk } from "./silk";
import { GithubIcon, GoogleIcon } from "./social-icons";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Mode = "signin" | "signup";

export type AuthSplitProps = {
  brand?: string;
  logoSrc?: string;
  panelEyebrow?: string;
  panelTitle?: string;
  className?: string;
};

export function AuthSplit({
  brand = "beUI",
  logoSrc = "/beui-mark.png",
  panelEyebrow = "Support, supercharged",
  panelTitle = "Turn every customer conversation into a fast, on-brand resolution",
  className,
}: AuthSplitProps) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [state, setState] = useState<ButtonState>("idle");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const isSignup = mode === "signup";

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: { email?: string; password?: string } = {};
    if (!EMAIL.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Use at least 6 characters.";
    if (next.email || next.password) {
      setErrors(next);
      return;
    }
    setErrors({});
    setState("loading");
    setTimeout(() => setState("success"), 1100);
  }

  return (
    <section
      className={cn("grid min-h-screen w-full lg:grid-cols-2", className)}
    >
      {/* Form. */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* biome-ignore lint/performance/noImgElement: small brand mark */}
          <img src={logoSrc} alt={brand} className="size-11 rounded-2xl" />
          <h1 className="mt-6 font-serif text-3xl text-foreground">
            {isSignup ? "Create your account" : "Sign in"}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            {isSignup
              ? `A few details and you're in.`
              : `Welcome back. Let's get you in.`}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-2.5">
            <SocialButton icon={<GoogleIcon className="size-4" />}>
              Google
            </SocialButton>
            <SocialButton
              icon={<GithubIcon className="size-4 text-foreground" />}
            >
              GitHub
            </SocialButton>
          </div>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-muted-foreground/70 text-xs">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="flex flex-col">
            <AnimatePresence initial={false}>
              {isSignup ? (
                <motion.div
                  key="name"
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.32, ease: EASE_OUT }
                  }
                  className="overflow-hidden"
                >
                  <div className="pb-3">
                    <InputRow icon={<User className="size-4" />}>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        className={inputClass}
                      />
                    </InputRow>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="pb-3">
              <InputRow
                icon={<Mail className="size-4" />}
                invalid={!!errors.email}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                      setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="you@company.com"
                  className={inputClass}
                />
              </InputRow>
              <FieldError message={errors.email} />
            </div>

            <InputRow
              icon={<Lock className="size-4" />}
              invalid={!!errors.password}
            >
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: undefined }));
                }}
                placeholder="Password"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
              >
                {show ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </InputRow>
            <FieldError message={errors.password} />

            <StatefulButton
              type="submit"
              state={state}
              size="lg"
              className="mt-4 w-full rounded-full"
              loadingText={isSignup ? "Creating" : "Signing in"}
              successText={isSignup ? "Account created" : "Signed in"}
            >
              {isSignup ? "Create account" : "Sign in"}
            </StatefulButton>
          </form>

          <p className="mt-2 text-muted-foreground text-sm">
            {isSignup ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(isSignup ? "signin" : "signup");
                setState("idle");
              }}
              className="font-medium text-foreground underline underline-offset-2"
            >
              {isSignup ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>
      </div>

      {/* Marketing copy over a flowing silk backdrop. */}
      <div className="relative hidden overflow-hidden lg:block">
        <Silk
          className="absolute inset-0"
          color="#5b8a72"
          speed={4}
          scale={1}
          noiseIntensity={1.4}
          rotation={0}
        />
        {/* Subtle darken so white copy stays legible over the silk. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        <div className="relative flex h-full flex-col justify-end p-12">
          <motion.p
            initial={
              reduce ? false : { opacity: 0, y: 12, filter: "blur(6px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.6, ease: EASE_OUT }
            }
            className="font-medium text-sm text-white/85 drop-shadow"
          >
            {panelEyebrow}
          </motion.p>
          <motion.h2
            initial={
              reduce ? false : { opacity: 0, y: 16, filter: "blur(8px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.6, ease: EASE_OUT, delay: 0.1 }
            }
            className="mt-3 max-w-md text-balance font-semibold text-3xl text-white leading-tight drop-shadow-md"
          >
            {panelTitle}
          </motion.h2>
        </div>
      </div>
    </section>
  );
}

function SocialButton({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-background/60 font-medium text-foreground text-sm transition-colors hover:bg-muted"
    >
      {icon}
      {children}
    </button>
  );
}

function InputRow({
  icon,
  invalid,
  children,
}: {
  icon: ReactNode;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-2.5 rounded-xl border bg-background px-3.5 transition-colors focus-within:ring-2 focus-within:ring-foreground/30",
        invalid ? "border-rose-500/60" : "border-border/70",
      )}
    >
      <span className={cn(invalid ? "text-rose-500" : "text-muted-foreground")}>
        {icon}
      </span>
      {children}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="overflow-hidden pt-1.5 text-rose-500 text-xs"
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

const inputClass =
  "min-w-0 flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/70";
