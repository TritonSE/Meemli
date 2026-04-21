"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "../../context/AuthContext";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      void router.replace("/");
    }
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) return null;

  return <>{children}</>;
}
