"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { useAppointment } from "@/features/appointments/hooks/useAppointments";
import { appointmentsService } from "@/features/appointments/services/appointment.service";
import { useModal } from "@/components/providers/ModalProvider";
import { ApiClientError } from "@/lib/api/client";

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

export default function AppointmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params?.id ?? 0);
  const { confirmModal } = useModal();
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const { data, isLoading, isError, refetch } = useAppointment(id);
  const appointment = data?.appointment;

  const canManage = useMemo(() => {
    if (!appointment) return false;
    return !["COMPLETED", "CANCELLED"].includes(appointment.status);
  }, [appointment]);

  async function handleCancel() {
    if (!appointment) return;

    const confirmed = await confirmModal({
      type: "warning",
      title: "Cancelar agendamento?",
      message: `Cancelar agendamento de ${formatDateTime(appointment.scheduled_at)}?\n\nEssa ação não poderá ser desfeita.`,
      confirmLabel: "Cancelar agendamento",
      cancelLabel: "Voltar",
      confirmColor: "error",
    });

    if (!confirmed) return;

    setIsCanceling(true);
    setCancelError("");

    try {
      await appointmentsService.cancel(appointment.id);
      router.refresh();
      await refetch();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setCancelError(error.message);
        return;
      }

      setCancelError("Não foi possível cancelar este agendamento no momento.");
    } finally {
      setIsCanceling(false);
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !appointment) {
    return (
      <Box>
        <Alert severity="error" action={<Button onClick={() => refetch()}>Tentar novamente</Button>}>
          Não foi possível carregar este agendamento.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3, justifyContent: "space-between" }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Detalhes do agendamento
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {formatDateTime(appointment.scheduled_at)}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button component={Link} href="/agendamentos" variant="outlined">
            Voltar
          </Button>
          {canManage && (
            <Button component={Link} href={`/agendamentos/${appointment.id}/editar`} variant="contained">
              Alterar
            </Button>
          )}
        </Stack>
      </Stack>

      {cancelError && <Alert severity="error" sx={{ mb: 3 }}>{cancelError}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Stack spacing={2.5}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Informações do agendamento
                  </Typography>
                  <AppointmentStatusBadge status={appointment.status} />
                </Stack>

                <Divider />

                <Stack spacing={1.5}>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography color="text.secondary">Data e horário</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{formatDateTime(appointment.scheduled_at)}</Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography color="text.secondary">Duração</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{appointment.duration} min</Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography color="text.secondary">Valor total</Typography>
                    <Typography sx={{ fontWeight: 700, color: "primary.main" }}>{formatPrice(appointment.total)}</Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography color="text.secondary">Canal</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{appointment.channel}</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Serviços
                </Typography>

                {appointment.services.map((service) => (
                  <Box key={`${appointment.id}-${service.service_id}`} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{service.service_name}</Typography>
                        <Typography variant="body2" color="text.secondary">{service.status}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatPrice(service.price_charged)}
                      </Typography>
                    </Stack>
                  </Box>
                ))}

                {canManage && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCancel}
                    disabled={isCanceling}
                  >
                    {isCanceling ? "Cancelando..." : "Cancelar agendamento"}
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
