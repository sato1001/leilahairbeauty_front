"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";

import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import type { AppointmentDetailResponse } from "@/features/appointments/types/appointment.types";

function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function AppointmentCard({ appointment }: { appointment: AppointmentDetailResponse }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "space-between" }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(appointment.scheduled_at)}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                {appointment.services.map((item) => item.service_name).join(" • ") || "Atendimento"}
              </Typography>
            </Box>

            <AppointmentStatusBadge status={appointment.status} />
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Duração</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{appointment.duration} min</Typography>
            </Stack>

            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Valor</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                {formatPrice(appointment.total)}
              </Typography>
            </Stack>
          </Stack>

          <Button component={Link} href={`/agendamentos/${appointment.id}`} variant="outlined" fullWidth>
            Ver detalhes
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
