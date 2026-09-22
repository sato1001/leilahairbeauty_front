"use client";

import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const adminNavItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Agendamentos", href: "/admin/agendamentos" },
  { label: "Serviços", href: "/admin/servicos" },
];

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("leila_auth_token");
    localStorage.removeItem("leila_auth_user");
    router.replace("/login");
  }

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Toolbar />
      <List>
        {adminNavItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton href={item.href} onClick={() => setMobileOpen(false)}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AdminRouteGuard>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f7f3f5" }}>
        <AppBar position="sticky" color="transparent" elevation={0} sx={{ backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(122,63,84,0.15)" }}>
          <Toolbar>
            {isMobile && (
              <IconButton color="inherit" edge="start" aria-label="menu" onClick={() => setMobileOpen(true)} sx={{ mr: 2, color: "text.primary" }}>
                <MenuIcon />
              </IconButton>
            )}

            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: "text.primary" }}>
              Leila Hair &amp; Beauty | Admin
            </Typography>

            {!isMobile && (
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                {adminNavItems.map((item) => (
                  <Typography
                    key={item.label}
                    component="a"
                    href={item.href}
                    sx={{ color: "text.primary", textDecoration: "none", fontWeight: 500 }}
                  >
                    {item.label}
                  </Typography>
                ))}
                <Typography component="button" type="button" onClick={handleLogout} sx={{ background: "none", border: "none", color: "text.primary", fontWeight: 600, cursor: "pointer" }}>
                  Sair
                </Typography>
              </Stack>
            )}
          </Toolbar>
        </AppBar>

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
        >
          {drawer}
        </Drawer>

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          {children}
        </Container>
      </Box>
    </AdminRouteGuard>
  );
}
