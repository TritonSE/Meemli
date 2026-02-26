"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const PUBLIC_PATHS = ["/login", "/login/", "/activate", "/activate/", "/forgot-password", "/forgot-password/"];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublic) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
    }
  }, [user, loading, pathname, router, isPublic]);

  // If this is a public page (login, activate, etc.) render immediately so users can sign in.
  if (isPublic) return <>{children}</>;

  // While auth state is resolving for protected pages, render nothing (or optional spinner).
  if (loading) return null;

  // If user is not present we already redirected; don't render children.
  if (!user) return null;

  return <>{children}</>;
}

export default ProtectedRoute;
