"use client";

import { Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { getNavigationItems, getStoredUser, isNavigationActive } from "@/components/layout/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setUser(getStoredUser());
      setHasHydrated(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (user?.role === "CLIENT" && pathname === "/") {
      router.replace("/agendamentos");
    }
  }, [pathname, router, user?.role]);

  const role = user?.role;
  const navItems = useMemo(() => getNavigationItems(role), [role]);

  function handleLogout() {
    localStorage.removeItem("leila_auth_token");
    localStorage.removeItem("leila_auth_user");
    router.replace("/login");
  }

  if (!hasHydrated || !user || navItems.length === 0) {
    return <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>{children}</Box>;
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", backgroundColor: "background.default" }}>
      <AppSidebar
        items={navItems}
        activePath={pathname}
        userName={user.name || "Usuário"}
        role={role}
        mobileOpen={isMobile ? mobileOpen : false}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppHeader
          title={
            navItems.find((item) => isNavigationActive(pathname, item.href, item.exact))?.label ??
              "Leila Hair Beauty"
          }
          userName={user.name || "Usuário"}
          role={role}
          isMobile={isMobile}
          onMenuOpen={() => setMobileOpen(true)}
        />

        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            px: { xs: 2, md: 4 },
            py: { xs: 3, md: 5 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
