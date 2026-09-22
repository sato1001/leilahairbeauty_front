"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";

import { AdminAppointmentForm } from "@/features/appointments/components/AdminAppointmentForm";

export default function NewAdminAppointmentPage() {
  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Novo agendamento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registre um atendimento por telefone: cliente, serviços, data e horário.
          </Typography>
        </Box>

        <Button component={Link} href="/admin/agendamentos" variant="outlined">
          Voltar
        </Button>
      </Stack>

      <AdminAppointmentForm />
    </Box>
  );
}
