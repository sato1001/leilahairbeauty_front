"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useCreateAppointment } from "@/features/appointments/hooks/useCreateAppointment";
import {
  bookingFormSchema,
  type BookingFormValues,
} from "@/features/appointments/schemas/appointment.schema";
import type { CreateAppointmentResponse } from "@/features/appointments/types/appointment.types";
import { useServices } from "@/features/services/hooks/useServices";
import type { ServiceItem } from "@/features/services/types/service.types";
import { useNotification } from "@/components/providers/NotificationProvider";
import { ApiClientError } from "@/lib/api/client";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function BookingForm() {
  const router = useRouter();
  const { notify } = useNotification();
  const { data: services = [], isLoading, isError, refetch } = useServices();
  const { mutateAsync, isPending } = useCreateAppointment();
  const [submitError, setSubmitError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      scheduled_at: "",
      services: [],
    },
  });

  const selectedServiceIds = useWatch({ control, name: "services" }) ?? [];

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("leila_auth_token")) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (isError) {
      notify({
        severity: "error",
        message: "Não foi possível carregar os serviços disponíveis.",
      });
    }
  }, [isError, notify]);

  useEffect(() => {
    const combinedValue = selectedDate && selectedTime ? `${selectedDate}T${selectedTime}` : "";
    setValue("scheduled_at", combinedValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [selectedDate, selectedTime, setValue]);

  const selectedServices = services.filter((service) => selectedServiceIds.includes(service.id));

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration_minutes, 0);

  function handleToggleService(serviceId: number) {
    const nextSelection = selectedServiceIds.includes(serviceId)
      ? selectedServiceIds.filter((id) => id !== serviceId)
      : [...selectedServiceIds, serviceId];

    setValue("services", nextSelection, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(values: BookingFormValues) {
    setSubmitError("");

    try {
      const payload = {
        scheduled_at: new Date(values.scheduled_at).toISOString(),
        services: values.services,
      };

      const result = await mutateAsync(payload);
      notify({
        severity: "success",
        message: `Agendamento criado com sucesso para ${new Date(result.appointment.scheduled_at).toLocaleString("pt-BR")}.`,
      });
      setValue("scheduled_at", "", { shouldDirty: true, shouldValidate: true });
      setValue("services", [], { shouldDirty: true, shouldValidate: true });
    } catch (error) {
      let message = "Não foi possível criar o agendamento no momento.";
      if (error instanceof ApiClientError) {
        message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setSubmitError(message);
      notify({
        severity: "error",
        message,
      });
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" action={<Button onClick={() => refetch()}>Tentar novamente</Button>}>
        Não foi possível carregar os serviços disponíveis.
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: "grid", gap: 3 }}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Agendar atendimento
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Escolha os serviços e o melhor horário para o seu cuidado.
        </Typography>
      </Box>

      {submitError && (
        <Alert severity="error">{submitError}</Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                    1. Escolha os serviços
                  </Typography>

                  <Grid container spacing={2}>
                    {services.map((service: ServiceItem) => {
                      const isSelected = selectedServiceIds.includes(service.id);

                      return (
                        <Grid key={service.id} size={{ xs: 12, md: 6 }}>
                          <Card
                            variant={isSelected ? "elevation" : "outlined"}
                            sx={{
                              height: "100%",
                              borderColor: isSelected ? "primary.main" : "divider",
                              backgroundColor: isSelected ? "rgba(122, 63, 84, 0.04)" : "background.paper",
                            }}
                          >
                            <CardContent sx={{ display: "grid", gap: 2, height: "100%" }}>
                              <Stack spacing={1}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  {service.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {service.description || "Sem descrição adicional."}
                                </Typography>
                              </Stack>

                              <Stack
                                direction="row"
                                sx={{ justifyContent: "space-between", alignItems: "center" }}
                              >
                                <Typography variant="caption" color="text.secondary">
                                  {service.duration_minutes} min
                                </Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "primary.main" }}>
                                  {formatPrice(service.price)}
                                </Typography>
                              </Stack>

                              <Button
                                variant={isSelected ? "contained" : "outlined"}
                                onClick={() => handleToggleService(service.id)}
                                type="button"
                              >
                                {isSelected ? "Selecionado" : "Selecionar"}
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {errors.services && (
                    <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
                      {errors.services.message}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                    2. Defina data e horário
                  </Typography>

                  <Stack spacing={2}>
                    <TextField
                      label="Data"
                      type="date"
                      fullWidth
                      value={selectedDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      error={Boolean(errors.scheduled_at)}
                      helperText={errors.scheduled_at?.message}
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                    />

                    <TextField
                      label="Horário"
                      type="time"
                      fullWidth
                      value={selectedTime}
                      onChange={(event) => setSelectedTime(event.target.value)}
                      error={Boolean(errors.scheduled_at)}
                      helperText={errors.scheduled_at?.message}
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ position: "sticky", top: 24 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Resumo do agendamento
                </Typography>

                {selectedServices.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum serviço selecionado ainda.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {selectedServices.map((service) => (
                      <Box key={service.id}>
                        <Stack
                          direction="row"
                          sx={{ justifyContent: "space-between", alignItems: "center" }}
                          spacing={2}
                        >
                          <Typography variant="body2">{service.name}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatPrice(service.price)}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}

                <Divider />

                <Stack spacing={1}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">Duração total</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {totalDuration} min
                    </Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">Valor total</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {formatPrice(totalPrice)}
                    </Typography>
                  </Stack>
                </Stack>

                <Button type="submit" variant="contained" size="large" disabled={isPending || selectedServices.length === 0}>
                  {isPending ? "Agendando..." : "Confirmar agendamento"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
