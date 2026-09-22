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
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { useAppointment } from "@/features/appointments/hooks/useAppointments";
import { appointmentsService } from "@/features/appointments/services/appointment.service";
import type { AppointmentDetailResponse } from "@/features/appointments/types/appointment.types";
import { useModal } from "@/components/providers/ModalProvider";
import { useNotification } from "@/components/providers/NotificationProvider";
import { ApiClientError } from "@/lib/api/client";

const channelLabels: Record<string, string> = {
  ONLINE: "Online",
  PHONE: "Telefone",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function AdminAppointmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id ?? 0);
  const queryClient = useQueryClient();
  const { confirmModal } = useModal();
  const { notify } = useNotification();

  const { data, isLoading, isError, refetch } = useAppointment(id);
  const appointment = data?.appointment;

  useEffect(() => {
    if (isError) {
      notify({
        severity: "error",
        message: "Não foi possível carregar este agendamento.",
      });
    }
  }, [isError, notify]);

  const canConfirm = appointment?.status === "PENDING";
  const canComplete = appointment?.status === "CONFIRMED";
  const canCancel = appointment ? !["COMPLETED", "CANCELLED"].includes(appointment.status) : false;
  const canEdit = appointment ? !["COMPLETED", "CANCELLED"].includes(appointment.status) : false;

  const setCachedAppointment = (nextAppointment: AppointmentDetailResponse) => {
    queryClient.setQueryData(["appointments", id], (previous: { appointment?: AppointmentDetailResponse } | undefined) => {
      if (!previous) {
        return { appointment: nextAppointment };
      }

      return {
        ...previous,
        appointment: nextAppointment,
      };
    });

    void queryClient.invalidateQueries({ queryKey: ["appointments"] });
  };

  const confirmMutation = useMutation({
    mutationFn: () => appointmentsService.confirm(id),
    onSuccess: (response) => {
      notify({ severity: "success", message: "Agendamento confirmado com sucesso." });
      setCachedAppointment(response.appointment);
    },
    onError: (error) => {
      notify({
        severity: "error",
        message: error instanceof ApiClientError ? error.message : "Não foi possível confirmar este agendamento.",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => appointmentsService.complete(id),
    onSuccess: (response) => {
      notify({ severity: "success", message: "Agendamento concluído com sucesso." });
      setCachedAppointment(response.appointment);
    },
    onError: (error) => {
      notify({
        severity: "error",
        message: error instanceof ApiClientError ? error.message : "Não foi possível concluir este agendamento.",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => appointmentsService.cancel(id),
    onSuccess: (response) => {
      notify({ severity: "success", message: "Agendamento cancelado com sucesso." });
      setCachedAppointment(response.appointment);
    },
    onError: (error) => {
      notify({
        severity: "error",
        message: error instanceof ApiClientError ? error.message : "Não foi possível cancelar este agendamento.",
      });
    },
  });

  async function handleConfirm() {
    if (!appointment) return;

    const confirmed = await confirmModal({
      type: "confirm",
      title: "Confirmar agendamento?",
      message: `Confirmar o agendamento de ${formatDateTime(appointment.scheduled_at)}?`,
      confirmLabel: "Confirmar",
      cancelLabel: "Voltar",
      confirmColor: "primary",
    });

    if (!confirmed) {
      return;
    }

    confirmMutation.mutate();
  }

  async function handleComplete() {
    if (!appointment) return;

    const confirmed = await confirmModal({
      type: "confirm",
      title: "Concluir agendamento?",
      message: `Concluir o agendamento de ${formatDateTime(appointment.scheduled_at)}?`,
      confirmLabel: "Concluir",
      cancelLabel: "Voltar",
      confirmColor: "success",
    });

    if (!confirmed) {
      return;
    }

    completeMutation.mutate();
  }

  async function handleCancel() {
    if (!appointment) return;

    const confirmed = await confirmModal({
      type: "warning",
      title: "Cancelar agendamento?",
      message: `Cancelar o agendamento de ${formatDateTime(appointment.scheduled_at)}?`,
      confirmLabel: "Cancelar agendamento",
      cancelLabel: "Voltar",
      confirmColor: "error",
    });

    if (!confirmed) {
      return;
    }

    cancelMutation.mutate();
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
        <Alert severity="error" action={<Button onClick={() => void refetch()}>Tentar novamente</Button>}>
          Não foi possível carregar este agendamento.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 3 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Detalhes do agendamento
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {formatDateTime(appointment.scheduled_at)}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button component={Link} href="/admin/agendamentos" variant="outlined">
            Voltar
          </Button>
          {canEdit && (
            <Button component={Link} href={`/admin/agendamentos/${appointment.id}/editar`} variant="contained">
              Alterar
            </Button>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Stack spacing={2.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Cliente
                </Typography>

                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography color="text.secondary">Nome</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{appointment.client.name}</Typography>
                </Stack>

                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography color="text.secondary">E-mail</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{appointment.client.email}</Typography>
                </Stack>

                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography color="text.secondary">Telefone</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{appointment.client.phone || "Não informado"}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Stack spacing={2.5}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Agendamento
                  </Typography>
                  <AppointmentStatusBadge status={appointment.status} />
                </Stack>

                <Divider />

                <Stack spacing={1.5}>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography color="text.secondary">Data</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{formatDate(appointment.scheduled_at)}</Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography color="text.secondary">Horário inicial</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{formatDateTime(appointment.scheduled_at)}</Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography color="text.secondary">Horário final</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{formatDateTime(appointment.ends_at)}</Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography color="text.secondary">Duração</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{appointment.duration} min</Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography color="text.secondary">Canal</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{channelLabels[appointment.channel] ?? appointment.channel}</Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography color="text.secondary">Criação</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{formatDateTime(appointment.created_at)}</Typography>
                  </Stack>
                </Stack>

                <Divider />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  {canConfirm && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleConfirm}
                      disabled={confirmMutation.isPending}
                    >
                      {confirmMutation.isPending ? "Confirmando..." : "Confirmar"}
                    </Button>
                  )}

                  {canComplete && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleComplete}
                      disabled={completeMutation.isPending}
                    >
                      {completeMutation.isPending ? "Concluindo..." : "Concluir"}
                    </Button>
                  )}

                  {canCancel && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleCancel}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? "Cancelando..." : "Cancelar"}
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Serviços
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "primary.main" }}>
                    {formatPrice(appointment.total)}
                  </Typography>
                </Stack>

                {appointment.services.length === 0 ? (
                  <Typography color="text.secondary">Nenhum serviço vinculado.</Typography>
                ) : (
                  appointment.services.map((item) => (
                    <Box key={`${appointment.id}-${item.service_id}`} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                      <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }} spacing={1}>
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>{item.service_name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Status do item: {item.status}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 600 }}>{formatPrice(item.price_charged)}</Typography>
                      </Stack>
                    </Box>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
