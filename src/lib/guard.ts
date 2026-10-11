"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "./store";
import type { Role } from "./types";

/**
 * Demo route guard. Returns true only when the signed-in user has the required role.
 * Anyone else is redirected (to login, or to their own home).
 * In production this check belongs on the server (JWT/session), not only in the UI.
 */
export function useRequireRole(role: Role): boolean {
  const { ready, user } = useApp();
  const router = useRouter();
  const allowed = ready && user?.role === role;

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      router.replace(`/login?next=${next}`);
    } else if (user.role !== role) {
      router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [ready, user, role, router]);

  return allowed;
}
