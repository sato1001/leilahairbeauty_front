"use client";

import { AppBar, Box, Container, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { label: "Início", href: "/" },
  { label: "Serviços", href: "/servicos" },
  { label: "Meus agendamentos", href: "/agendamentos" },
  { label: "Agendar", href: "/agendar" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Toolbar />
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={Link} href={item.href} onClick={() => setMobileOpen(false)}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(122,63,84,0.12)" }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              aria-label="menu"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: "text.primary" }}>
            Leila Hair &amp; Beauty
          </Typography>

          {!isMobile && (
            <Stack direction="row" spacing={2}>
              {navItems.map((item) => (
                <Typography
                  key={item.label}
                  component={Link}
                  href={item.href}
                  sx={{ color: "text.primary", textDecoration: "none", fontWeight: 500 }}
                >
                  {item.label}
                </Typography>
              ))}
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
  );
}
