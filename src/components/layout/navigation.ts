import { createElement, type ReactNode } from "react";
import {
  AccountCircleOutlined,
  CalendarMonthOutlined,
  ContentCutOutlined,
  DashboardOutlined,
} from "@mui/icons-material";

export type NavigationItem = {
  label: string;
  href: string;
  icon: ReactNode;
  exact?: boolean;
};

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawUser = localStorage.getItem("leila_auth_user");
    if (!rawUser) {
      return null;
    }

    return JSON.parse(rawUser) as { name?: string; email?: string; role?: string };
  } catch {
    return null;
  }
}

export function getNavigationItems(role?: string): NavigationItem[] {
  switch (role) {
    case "ADMIN":
      return [
        { label: "Dashboard", href: "/admin", icon: createElement(DashboardOutlined), exact: true },
        { label: "Agendamentos", href: "/admin/agendamentos", icon: createElement(CalendarMonthOutlined) },
        { label: "Serviços", href: "/admin/servicos", icon: createElement(ContentCutOutlined) },
      ];
    case "CLIENT":
      return [
        { label: "Meus Agendamentos", href: "/agendamentos", icon: createElement(AccountCircleOutlined) },
        { label: "Serviços", href: "/servicos", icon: createElement(ContentCutOutlined) },
      ];
    default:
      return [];
  }
}

export function isNavigationActive(pathname: string, href: string, exact = false) {
  const normalizedPathname = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  const normalizedHref = href === "/" ? "/" : href.replace(/\/+$/, "");

  if (exact) {
    return normalizedPathname === normalizedHref;
  }

  if (normalizedHref === "/") {
    return normalizedPathname === "/";
  }

  return normalizedPathname === normalizedHref || normalizedPathname.startsWith(`${normalizedHref}/`);
}
