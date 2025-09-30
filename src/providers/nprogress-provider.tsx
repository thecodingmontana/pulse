import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export default function NprogressProvider() {
  const routerState = useRouterState();
  const prevPathnameRef = useRef("");

  useEffect(() => {
    const currentPathname = routerState.location.pathname;
    const pathnameChanged = prevPathnameRef.current !== currentPathname;

    if (pathnameChanged && routerState.status === "pending") {
      NProgress.start();
      prevPathnameRef.current = currentPathname;
    }

    if (routerState.status === "idle") {
      NProgress.done();
      const timeoutId = setTimeout(() => {
        NProgress.remove();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [routerState.status, routerState.location.pathname]);

  return null;
}
