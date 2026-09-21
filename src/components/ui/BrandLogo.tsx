import { Stack, Typography } from "@mui/material";

export function BrandLogo() {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
      <Typography
        sx={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(135deg, #7a3f54 0%, #d7a98a 100%)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        LH
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
        Leila Hair &amp; Beauty
      </Typography>
    </Stack>
  );
}
