/** biome-ignore-all lint/suspicious/noArrayIndexKey: ignore all */

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ShimmerButton } from "~/components/shimmer-button";
import FlowingWaveRays from "~/components/svgs/flowing-wave-rays";
import Pulse from "~/components/svgs/pulse";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const title = "Pulse – Real-Time PM2 Monitoring";
  const words = title.split(" ");

  const description =
    "Monitor and manage Node.js applications running on PM2 with live charts, logs, and alerts. Built for performance and reliability.";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <motion.div
          animate={{ opacity: 1 }}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <FlowingWaveRays />
        </motion.div>
      </div>

      <motion.header
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6 lg:px-12"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <motion.div
          className="flex items-center space-x-2 pl-3 sm:pl-6 lg:pl-12"
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          whileHover={{ scale: 1.05 }}
        >
          <Pulse className="h-auto w-[8rem]" />
        </motion.div>
      </motion.header>

      <main className="sm:-mt-12 lg:-mt-24 relative z-10 flex min-h-[calc(100vh-80px)] max-w-6xl flex-col items-start justify-start px-4 pt-4 pl-6 sm:justify-center sm:px-6 sm:pl-12 lg:px-12 lg:pl-20">
        <h1 className="mb-4 text-balance font-bold text-4xl text-white leading-tight sm:mb-6 sm:text-3xl md:text-5xl lg:text-6xl xl:text-8xl">
          {words.map((word, index) => (
            <motion.span
              animate={{ opacity: 1, y: 0 }}
              className="mr-[0.25em] inline-block"
              initial={{ opacity: 0, y: 20 }}
              key={word}
              transition={{
                duration: 0.5,
                delay: 0.4 + index * 0.1,
                ease: "easeOut",
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <p className="mb-6 max-w-2xl text-pretty text-sm text-white/70 sm:mb-8 sm:text-base md:text-sm lg:text-2xl">
          {description.split("").map((char, index) => (
            <motion.span
              animate={{ opacity: 1 }}
              className="inline-block"
              initial={{ opacity: 0 }}
              key={index}
              transition={{
                duration: 0.05,
                delay: 1.2 + index * 0.02,
                ease: "easeOut",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </p>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: 0.8,
            delay: 1.2 + description.length * 0.02 + 0.3,
            ease: "easeOut",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/auth/signup">
            <ShimmerButton className="flex rounded-xl px-4 py-2 font-medium text-sm shadow-lg hover:bg-orange-600 lg:px-6 lg:text-base dark:not-first:bg-[#642808] dark:text-white">
              Get Started
            </ShimmerButton>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
