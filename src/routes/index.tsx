import { createFileRoute } from "@tanstack/react-router";
import { ShimmerButton } from "~/components/shimmer-button";
import FlowingWaveRays from "~/components/svgs/flowing-wave-rays";
import Pulse from "~/components/svgs/pulse";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0">
          <FlowingWaveRays />
        </div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6 lg:px-12">
        <div className="flex items-center space-x-2 pl-3 sm:pl-6 lg:pl-12">
          <Pulse className="h-auto w-[8rem]" />
        </div>
      </header>

      <main className="sm:-mt-12 lg:-mt-24 relative z-10 flex min-h-[calc(100vh-80px)] max-w-6xl flex-col items-start justify-start px-4 pt-4 pl-6 sm:justify-center sm:px-6 sm:pl-12 lg:px-12 lg:pl-20">
        <h1 className="mb-4 text-balance font-bold text-4xl text-white leading-tight sm:mb-6 sm:text-3xl md:text-5xl lg:text-6xl xl:text-8xl">
          Pulse – Real-Time PM2 Monitoring
        </h1>

        <p className="mb-6 max-w-2xl text-pretty text-sm text-white/70 sm:mb-8 sm:text-base md:text-sm lg:text-2xl">
          Monitor and manage Node.js applications running on PM2 with live charts, logs,
          and alerts. Built for performance and reliability.
        </p>

        <ShimmerButton className="flex rounded-xl px-4 py-2 font-medium text-sm shadow-lg hover:bg-orange-600 lg:px-6 lg:text-base dark:not-first:bg-[#642808] dark:text-white">
          Get Started
        </ShimmerButton>
      </main>
    </div>
  );
}
