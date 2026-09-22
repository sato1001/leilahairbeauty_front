"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { bookingFormSchema } from "@/features/appointments/schemas/appointment.schema";
import type { BookingFormValues } from "@/features/appointments/schemas/appointment.schema";
import { appointmentsService } from "@/features/appointments/services/appointment.service";
import type { AppointmentDetailResponse } from "@/features/appointments/types/appointment.types";
import { useServices } from "@/features/services/hooks/useServices";
import { ApiClientError } from "@/lib/api/client";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function AppointmentEditorForm({
  appointment,
  successRedirectUrl,
}: {
  appointment: AppointmentDetailResponse;
  successRedirectUrl: string;
}) {
  const router = useRouter();
  const { data: services = [] } = useServices();
  const [submitError, setSubmitError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const initialDate = useMemo(() => {
    const scheduled = new Date(appointment.scheduled_at);
    return scheduled.toISOString().slice(0, 10);
  }, [appointment.scheduled_at]);

  const initialTime = useMemo(() => {
    const scheduled = new Date(appointment.scheduled_at);
    return scheduled.toISOString().slice(11, 16);
  }, [appointment.scheduled_at]);

  const currentSelectedDate = selectedDate || initialDate;
  const currentSelectedTime = selectedTime || initialTime;

  const {
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      scheduled_at: "",
      services: appointment.services.map((item) => item.service_id),
    },
  });

  const selectedServiceIds = watch("services") ?? appointment.services.map((item) => item.service_id);

  useEffect(() => {
    const combinedValue = currentSelectedDate && currentSelectedTime ? `${currentSelectedDate}T${currentSelectedTime}` : "";
    setValue("scheduled_at", combinedValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [currentSelectedDate, currentSelectedTime, setValue]);

  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(service.id)),
    [selectedServiceIds, services],
  );

  function handleToggleService(serviceId: number) {
    const next = selectedServiceIds.includes(serviceId)
      ? selectedServiceIds.filter((id) => id !== serviceId)
      : [...selectedServiceIds, serviceId];

    setValue("services", next, { shouldDirty: true, shouldValidate: true });
    clearErrors("services");
  }

  async function onSubmit(values: BookingFormValues) {
    setSubmitError("");

    try {
      await appointmentsService.update(appointment.id, {
        scheduled_at: values.scheduled_at,
        services: values.services,
      });

      router.push(successRedirectUrl);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setSubmitError(error.message);
        return;
      }

      setSubmitError("Não foi possível atualizar este agendamento.");
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Alterar agendamento
          </Typography>
        </Box>

        {submitError && <Alert severity="error">{submitError}</Alert>}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                      Serviços
                    </Typography>

                    <Grid container spacing={2}>
                      {services.map((service) => {
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
                                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{service.name}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {service.description || "Sem descrição adicional."}
                                  </Typography>
                                </Stack>

                                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {service.duration_minutes} min
                                  </Typography>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "primary.main" }}>
                                    {formatPrice(service.price)}
                                  </Typography>
                                </Stack>

                                <Button
                                  type="button"
                                  variant={isSelected ? "contained" : "outlined"}
                                  onClick={() => handleToggleService(service.id)}
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

                  <Divider />

                  <Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                      Data e horário
                    </Typography>

                    <Stack spacing={2}>
                      <TextField
                        label="Data"
                        type="date"
                        fullWidth
                        value={currentSelectedDate}
                        onChange={(event) => setSelectedDate(event.target.value)}
                        error={Boolean(errors.scheduled_at)}
                        helperText={errors.scheduled_at?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                      <TextField
                        label="Horário"
                        type="time"
                        fullWidth
                        value={currentSelectedTime}
                        onChange={(event) => setSelectedTime(event.target.value)}
                        error={Boolean(errors.scheduled_at)}
                        helperText={errors.scheduled_at?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Resumo da alteração
                  </Typography>

                  {selectedServices.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum serviço selecionado.
                    </Typography>
                  ) : (
                    selectedServices.map((service) => (
                      <Stack key={service.id} direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2">{service.name}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatPrice(service.price)}
                        </Typography>
                      </Stack>
                    ))
                  )}

                  <Divider />

                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Duração total
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selectedServices.reduce((sum, service) => sum + service.duration_minutes, 0)} min
                    </Typography>
                  </Stack>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting || selectedServices.length === 0}
                  >
                    {isSubmitting ? "Salvando..." : "Salvar alteração"}
                  </Button>

                  <Button type="button" variant="outlined" onClick={() => router.push(successRedirectUrl)}>
                    Cancelar
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
