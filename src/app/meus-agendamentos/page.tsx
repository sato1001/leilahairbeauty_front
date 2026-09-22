"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyAppointmentsLegacyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/agendamentos");
  }, [router]);

  return null;
}
