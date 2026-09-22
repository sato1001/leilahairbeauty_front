"use client";

import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, IconButton, Stack, Toolbar, Typography } from "@mui/material";

export function AppHeader({
  title,
  userName,
  role,
  isMobile,
  onMenuOpen,
}: {
  title: string;
  userName?: string;
  role?: string;
  isMobile: boolean;
  onMenuOpen?: () => void;
}) {
  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backgroundColor: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        borderRadius: 0,
        borderBottom: "1px solid rgba(122,63,84,0.12)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 68, md: 76 } }}>
        {isMobile && onMenuOpen && (
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Abrir menu"
            onClick={onMenuOpen}
            sx={{ mr: 1.5, color: "text.primary" }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: "text.primary" }}>
          {title}
        </Typography>

        {(userName || role) && (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {userName || "Usuário"}
            </Typography>
            {role && (
              <Typography variant="caption" sx={{ px: 1, py: 0.5, borderRadius: 999, backgroundColor: "rgba(122,63,84,0.08)", color: "primary.main", fontWeight: 700 }}>
                {role}
              </Typography>
            )}
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}
