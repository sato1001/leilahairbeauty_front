"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppShell } from "@/components/layout/AppShell";

function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("leila_auth_user");
      if (!rawUser) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(rawUser) as { role?: string };
      if (user.role !== "ADMIN") {
        router.replace("/");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRouteGuard>
      <AppShell>{children}</AppShell>
    </AdminRouteGuard>
  );
}
