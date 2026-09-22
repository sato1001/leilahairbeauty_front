"use client";

import {
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { isNavigationActive, type NavigationItem } from "@/components/layout/navigation";

export function AppSidebar({
  items,
  activePath,
  userName,
  role,
  mobileOpen,
  onClose,
  onLogout,
}: {
  items: NavigationItem[];
  activePath: string;
  userName?: string;
  role?: string;
  mobileOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}) {
  const content = (
    <Box sx={{ width: { xs: 280, md: 260 }, height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#fff", overflow: "hidden" }}>
      <Box sx={{ p: 2.5, borderBottom: "1px solid rgba(122,63,84,0.12)" }}>
        <BrandLogo />
      </Box>

      <List sx={{ px: 1.5, py: 2, flex: 1, overflowY: "auto" }}>
        {items.map((item) => {
          const active = isNavigationActive(activePath, item.href, item.exact);

          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={onClose}
                selected={active}
                sx={{
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  color: active ? "primary.main" : "text.primary",
                  backgroundColor: active ? "rgba(122,63,84,0.08)" : "transparent",
                  "&.Mui-selected": {
                    backgroundColor: "rgba(122,63,84,0.08)",
                  },
                  "&:hover": {
                    backgroundColor: active ? "rgba(122,63,84,0.12)" : "rgba(122,63,84,0.04)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? "primary.main" : "text.secondary" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontWeight: active ? 700 : 500,
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2.5, borderTop: "1px solid rgba(122,63,84,0.12)" }}>
        <Stack spacing={1}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Conectado como
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {userName || "Usuário"}
            </Typography>
          </Box>

          {role && (
            <Typography variant="caption" sx={{ display: "inline-flex", width: "fit-content", px: 1, py: 0.5, borderRadius: 999, backgroundColor: "rgba(122,63,84,0.08)", color: "primary.main", fontWeight: 700 }}>
              {role}
            </Typography>
          )}

          {onLogout && (
            <Button variant="outlined" color="inherit" onClick={onLogout} sx={{ mt: 1 }}>
              Sair
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={Boolean(mobileOpen)}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            backgroundColor: "#fff",
          },
        }}
      >
        {content}
      </Drawer>

      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          width: 260,
          borderRight: "1px solid rgba(122,63,84,0.12)",
          backgroundColor: "#fff",
          flexShrink: 0,
          height: "100dvh",
          overflow: "hidden",
        }}
      >
        {content}
      </Box>
    </>
  );
}
