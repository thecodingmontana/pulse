import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import SignupForm from "~/components/auth/signup/signup-form";
import Pulse from "~/components/svgs/pulse";

export const Route = createFileRoute("/_auth/auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen flex-1 items-center">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex w-full max-w-[360px] flex-col gap-8 p-5"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Link to="/">
            <Pulse className="h-auto w-28" />
          </Link>
        </motion.div>
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-1"
          initial={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="font-medium text-2xl text-zinc-950 leading-8 dark:text-white/90">
            Get Started with Pulse
          </h1>
          <div className="flex items-center gap-1">
            <p className="text-sm text-zinc-900/50 tracking-tight dark:text-white/50">
              Already have an account?
            </p>
            <Link
              className="flex items-center justify-center gap-1 font-medium text-brand text-sm outline-none hover:text-brand-secondary disabled:pointer-events-none disabled:text-zinc-950/10 dark:disabled:text-white/20 dark:hover:text-brand-secondary"
              to="/auth/signin"
            >
              <p>Sign in</p>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </motion.div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SignupForm />
        </motion.div>
      </motion.div>
    </div>
  );
}
