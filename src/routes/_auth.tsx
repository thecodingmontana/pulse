import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ThemeToggle } from "~/components/theme-toggle";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="relative flex bg-white dark:bg-zinc-950">
      <div className="absolute top-3 right-3">
        <ThemeToggle />
      </div>
      <Outlet />
    </main>
  );
}
