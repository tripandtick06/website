"use client";

import { useEffect } from "react";

/**
 * RegisterSW — registers the service worker `/sw.js` on the client.
 * Production-only by design (dev mode keeps fast-refresh + no cache pollution).
 *
 * Caller: src/app/layout.tsx mounts <RegisterSW /> once at root.
 */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => {
          // Soft-fail; offline support is progressive enhancement.
          console.warn("[sw] register failed:", err);
        });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
