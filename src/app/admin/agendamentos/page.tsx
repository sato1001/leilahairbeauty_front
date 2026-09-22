import { Box, Typography } from "@mui/material";

export default function AdminAppointmentsPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        Agendamentos
      </Typography>

      <Typography variant="body1" color="text.secondary">
        Esta área administrativa de agendamentos será implementada na próxima etapa.
      </Typography>
    </Box>
  );
}
