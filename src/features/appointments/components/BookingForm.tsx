"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useCreateAppointment } from "@/features/appointments/hooks/useCreateAppointment";
import {
  bookingFormSchema,
  type BookingFormValues,
} from "@/features/appointments/schemas/appointment.schema";
import type { CreateAppointmentResponse } from "@/features/appointments/types/appointment.types";
import { useServices } from "@/features/services/hooks/useServices";
import type { ServiceItem } from "@/features/services/types/service.types";
import { ApiClientError } from "@/lib/api/client";

// Horário de funcionamento do salão: terça a sábado, 09:00–19:00.
// Mantido em sincronia com a regra de negócio já implementada no backend
// (validateBusinessHours). Se o horário do salão mudar, ajuste aqui também.
const BUSINESS_OPEN_MINUTES = 9 * 60;
const BUSINESS_CLOSE_MINUTES = 19 * 60;
const SLOT_STEP_MINUTES = 30;
const CLOSED_WEEKDAYS = [0, 1]; // domingo, segunda

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

function isPastDay(date: Date, today: Date): boolean {
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return dateStart < todayStart;
}

function isClosedDay(date: Date): boolean {
  return CLOSED_WEEKDAYS.includes(date.getDay());
}

function minutesToLabel(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Gera a grade de dias do mês (com preenchimento antes/depois para alinhar as semanas). */
function buildCalendarGrid(monthDate: Date): Array<Date | null> {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const leadingBlanks = firstDayOfMonth.getDay();
  const days: Array<Date | null> = Array.from({ length: leadingBlanks }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

/** Calcula os horários disponíveis num dia, dado o horário de funcionamento e a duração total dos serviços. */
function getAvailableSlots(date: Date, durationMinutes: number, now: Date): string[] {
  if (durationMinutes <= 0 || isClosedDay(date) || isPastDay(date, now)) {
    return [];
  }

  const slots: string[] = [];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = isSameDay(date, now);

  for (
    let start = BUSINESS_OPEN_MINUTES;
    start + durationMinutes <= BUSINESS_CLOSE_MINUTES;
    start += SLOT_STEP_MINUTES
  ) {
    if (isToday && start <= nowMinutes) {
      continue;
    }
    slots.push(minutesToLabel(start));
  }

  return slots;
}

export function BookingForm() {
  const router = useRouter();
  const { data: services = [], isLoading, isError, refetch } = useServices();
  const { mutateAsync, isPending } = useCreateAppointment();
  const [submitError, setSubmitError] = useState("");
  const [createdAppointment, setCreatedAppointment] = useState<CreateAppointmentResponse | null>(null);

  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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
  const selectedServices = services.filter((service) => selectedServiceIds.includes(service.id));
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration_minutes, 0);

  const calendarDays = useMemo(() => buildCalendarGrid(visibleMonth), [visibleMonth]);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(visibleMonth),
    [visibleMonth]
  );

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return getAvailableSlots(selectedDate, totalDuration, today);
  }, [selectedDate, totalDuration, today]);

  // Se a duração mudar (ex.: usuário removeu um serviço) e o horário
  // escolhido deixar de caber no expediente, limpa a seleção de horário.
  useEffect(() => {
    if (selectedTime && !availableSlots.includes(selectedTime)) {
      setSelectedTime("");
    }
  }, [availableSlots, selectedTime]);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("leila_auth_token")) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const combinedValue =
      selectedDate && selectedTime ? `${toDateKey(selectedDate)}T${selectedTime}` : "";
    setValue("scheduled_at", combinedValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [selectedDate, selectedTime, setValue]);

  function handleToggleService(serviceId: number) {
    const nextSelection = selectedServiceIds.includes(serviceId)
      ? selectedServiceIds.filter((id) => id !== serviceId)
      : [...selectedServiceIds, serviceId];

    setValue("services", nextSelection, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    setSelectedTime("");
  }

  function handleChangeMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  async function onSubmit(values: BookingFormValues) {
    setSubmitError("");

    try {
      const payload = {
        scheduled_at: new Date(values.scheduled_at).toISOString(),
        services: values.services,
      };

      const result = await mutateAsync(payload);
      setCreatedAppointment(result);
      setValue("scheduled_at", "", { shouldDirty: true, shouldValidate: true });
      setValue("services", [], { shouldDirty: true, shouldValidate: true });
      setSelectedDate(null);
      setSelectedTime("");
    } catch (error) {
      if (error instanceof ApiClientError) {
        setSubmitError(error.message);
        return;
      }

      if (error instanceof Error) {
        setSubmitError(error.message);
        return;
      }

      setSubmitError("Não foi possível criar o agendamento no momento.");
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

      {submitError && <Alert severity="error">{submitError}</Alert>}

      {createdAppointment && (
        <Alert severity="success">
          Agendamento criado com sucesso para{" "}
          {new Date(createdAppointment.appointment.scheduled_at).toLocaleString("pt-BR")}.
        </Alert>
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
                    2. Escolha o dia
                  </Typography>

                  {totalDuration === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Selecione ao menos um serviço para ver os dias e horários disponíveis.
                    </Alert>
                  ) : null}

                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <IconButton
                          type="button"
                          onClick={() => handleChangeMonth(-1)}
                          aria-label="Mês anterior"
                          size="small"
                        >
                          ‹
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: "capitalize" }}>
                          {monthLabel}
                        </Typography>
                        <IconButton
                          type="button"
                          onClick={() => handleChangeMonth(1)}
                          aria-label="Próximo mês"
                          size="small"
                        >
                          ›
                        </IconButton>
                      </Stack>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(7, 1fr)",
                          gap: 0.5,
                          mb: 0.5,
                        }}
                      >
                        {WEEKDAY_LABELS.map((label) => (
                          <Typography
                            key={label}
                            variant="caption"
                            align="center"
                            sx={{ color: "text.secondary", fontWeight: 600 }}
                          >
                            {label}
                          </Typography>
                        ))}
                      </Box>

                      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5 }}>
                        {calendarDays.map((date, index) => {
                          if (!date) {
                            return <Box key={`blank-${index}`} />;
                          }

                          const disabled =
                            isPastDay(date, today) || isClosedDay(date) || totalDuration === 0;
                          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

                          return (
                            <Button
                              key={toDateKey(date)}
                              type="button"
                              size="small"
                              onClick={() => handleSelectDate(date)}
                              disabled={disabled}
                              variant={isSelected ? "contained" : "text"}
                              sx={{
                                minWidth: 0,
                                aspectRatio: "1 / 1",
                                borderRadius: 1.5,
                              }}
                            >
                              {date.getDate()}
                            </Button>
                          );
                        })}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {selectedDate && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                      3. Escolha o horário
                    </Typography>

                    {availableSlots.length === 0 ? (
                      <Alert severity="warning">
                        Não há horários disponíveis nesse dia para a duração selecionada. Tente outro dia.
                      </Alert>
                    ) : (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {availableSlots.map((slot) => (
                          <Chip
                            key={slot}
                            label={slot}
                            clickable
                            color={selectedTime === slot ? "primary" : "default"}
                            variant={selectedTime === slot ? "filled" : "outlined"}
                            onClick={() => setSelectedTime(slot)}
                          />
                        ))}
                      </Box>
                    )}

                    {errors.scheduled_at && (
                      <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
                        {errors.scheduled_at.message}
                      </Typography>
                    )}
                  </Box>
                )}
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

                {selectedDate && selectedTime && (
                  <>
                    <Divider />
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        Data e horário
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(
                          selectedDate
                        )}{" "}
                        às {selectedTime}
                      </Typography>
                    </Stack>
                  </>
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

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isPending || selectedServices.length === 0 || !selectedDate || !selectedTime}
                >
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