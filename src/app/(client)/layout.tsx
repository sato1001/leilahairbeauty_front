"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppShell } from "@/components/layout/AppShell";

function ClientRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("leila_auth_user");
      if (!rawUser) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(rawUser) as { role?: string };
      if (user.role !== "CLIENT") {
        router.replace("/admin");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientRouteGuard>
      <AppShell>{children}</AppShell>
    </ClientRouteGuard>
  );
}
