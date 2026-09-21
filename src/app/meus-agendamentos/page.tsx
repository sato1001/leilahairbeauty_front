import { Box, Typography } from "@mui/material";

export default function MeusAgendamentosPlaceholderPage() {
  return (
    <Box sx={{ py: 6, textAlign: "center" }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        Meus agendamentos
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Esta funcionalidade será implementada na próxima etapa.
      </Typography>
    </Box>
  );
}
