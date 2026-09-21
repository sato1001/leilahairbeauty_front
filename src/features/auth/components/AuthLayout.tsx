import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, rgba(122,63,84,0.08) 0%, rgba(245,212,182,0.2) 45%, rgba(255,255,255,1) 100%)",
        px: 2,
        py: 5,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            border: "1px solid rgba(122, 63, 84, 0.12)",
            backgroundColor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(6px)",
          }}
        >
          <Stack spacing={2.5} sx={{ alignItems: "center", textAlign: "center" }}>
            <Box
              sx={{
                width: 78,
                height: 78,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #7a3f54 0%, #d7a98a 100%)",
                color: "#fff",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              LH
            </Box>

            <Stack spacing={0.5}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: "text.primary" }}>
                {title}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {subtitle}
              </Typography>
            </Stack>
          </Stack>

          <Box sx={{ mt: 4 }}>{children}</Box>
        </Paper>
      </Container>
    </Box>
  );
}
