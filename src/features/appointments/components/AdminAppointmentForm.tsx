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
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  useCreateAdminClient,
  useSearchAdminClients,
} from "@/features/appointments/hooks/useAdminClients";
import { useCreateAppointment } from "@/features/appointments/hooks/useCreateAppointment";
import {
  adminBookingFormSchema,
  createAdminClientFormSchema,
  type AdminBookingFormValues,
  type CreateAdminClientFormValues,
} from "@/features/appointments/schemas/appointment.schema";
import type { AdminClientResponse } from "@/features/appointments/types/appointment.types";
import { useServices } from "@/features/services/hooks/useServices";
import type { ServiceItem } from "@/features/services/types/service.types";
import { ApiClientError } from "@/lib/api/client";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDuration(minutes: number) {
  if (minutes <= 0) return "—";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h${String(remainingMinutes).padStart(2, "0")}`;
}

function formatPhone(phone: string | null | undefined) {
  if (!phone) return "—";

  const digits = phone.replace(/\D+/g, "");

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return phone;
}

function formatDisplayDate(value: string) {
  if (!value) return "—";

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(year, month - 1, day));
}

function formatDisplayTime(value: string) {
  return value || "—";
}

function getTodayDateInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSalonOpenDay(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return false;

  const weekday = new Date(year, month - 1, day).getDay();
  return weekday >= 2 && weekday <= 6;
}

function buildLocalDateTime(dateValue: string, timeValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function mapAppointmentError(error: ApiClientError) {
  if (error.status === 409) {
    return "Esse horário já possui um agendamento. Escolha outro horário.";
  }

  if (error.status === 403) {
    return error.message || "Você não tem permissão para criar este agendamento.";
  }

  if (error.status === 404) {
    return error.message || "Cliente ou serviço não encontrado.";
  }

  if (error.status === 422) {
    return error.message || "Dados inválidos ou horário fora do funcionamento.";
  }

  return error.message;
}

export function AdminAppointmentForm() {
  const router = useRouter();
  const { data: services = [], isLoading: isLoadingServices, isError: isServicesError, refetch } = useServices();
  const { mutateAsync: createAppointment, isPending: isCreatingAppointment } = useCreateAppointment();
  const { mutateAsync: createClient, isPending: isCreatingClient } = useCreateAdminClient();

  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<AdminClientResponse | null>(null);
  const [clientSuccessMessage, setClientSuccessMessage] = useState("");
  const [clientError, setClientError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [dateHelper, setDateHelper] = useState("");

  const activeServices = services.filter((service) => service.active);

  const {
    data: searchData,
    isFetching: isSearching,
    isError: isSearchError,
  } = useSearchAdminClients(debouncedSearch);

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<AdminBookingFormValues>({
    resolver: zodResolver(adminBookingFormSchema),
    defaultValues: {
      client_id: 0,
      scheduled_at: "",
      services: [],
    },
  });

  const newClientForm = useForm<CreateAdminClientFormValues>({
    resolver: zodResolver(createAdminClientFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  const selectedServiceIds = useWatch({ control, name: "services" }) ?? [];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const combinedValue = selectedDate && selectedTime ? `${selectedDate}T${selectedTime}` : "";
    setValue("scheduled_at", combinedValue, {
      shouldDirty: true,
      shouldValidate: Boolean(combinedValue),
    });
  }, [selectedDate, selectedTime, setValue]);

  useEffect(() => {
    setValue("client_id", selectedClient?.id ?? 0, {
      shouldDirty: true,
      shouldValidate: Boolean(selectedClient),
    });
  }, [selectedClient, setValue]);

  const selectedServices = activeServices.filter((service) => selectedServiceIds.includes(service.id));
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration_minutes, 0);

  let endsAtLabel = "—";
  if (selectedDate && selectedTime && totalDuration > 0) {
    const start = buildLocalDateTime(selectedDate, selectedTime);
    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start.getTime() + totalDuration * 60 * 1000);
      endsAtLabel = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(end);
    }
  }

  const searchResults = searchData?.clients ?? [];

  function handleSelectClient(client: AdminClientResponse) {
    setSelectedClient(client);
    setClientMode("existing");
    setClientError("");
    setClientSuccessMessage("");
  }

  function handleToggleService(serviceId: number) {
    const nextSelection = selectedServiceIds.includes(serviceId)
      ? selectedServiceIds.filter((id) => id !== serviceId)
      : [...selectedServiceIds, serviceId];

    setValue("services", nextSelection, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function handleDateChange(value: string) {
    setSelectedDate(value);
    setDateHelper("");

    if (!value) return;

    if (!isSalonOpenDay(value)) {
      setDateHelper("O salão funciona de terça a sábado. Escolha outra data.");
    }
  }

  async function handleCreateClient(values: CreateAdminClientFormValues) {
    setClientError("");
    setClientSuccessMessage("");

    try {
      const payload: {
        name: string;
        phone: string;
        email?: string;
      } = {
        name: values.name,
        phone: values.phone,
      };

      if (values.email?.trim()) {
        payload.email = values.email.trim();
      }

      const result = await createClient(payload);
      setSelectedClient(result.client);
      setClientMode("existing");
      setClientSuccessMessage("Cliente criado com sucesso.");
      newClientForm.reset({ name: "", phone: "", email: "" });
      setSearchTerm(result.client.name);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setClientError(error.message);
        return;
      }

      if (error instanceof Error) {
        setClientError(error.message);
        return;
      }

      setClientError("Não foi possível criar o cliente no momento.");
    }
  }

  async function onSubmit(values: AdminBookingFormValues) {
    setSubmitError("");
    setSuccessMessage("");

    if (!selectedClient) {
      setSubmitError("Selecione um cliente para continuar.");
      return;
    }

    if (selectedDate && !isSalonOpenDay(selectedDate)) {
      setSubmitError("O salão funciona de terça a sábado. Escolha outra data.");
      return;
    }

    try {
      const scheduledAt = buildLocalDateTime(selectedDate, selectedTime);

      const result = await createAppointment({
        client_id: values.client_id,
        scheduled_at: scheduledAt.toISOString(),
        services: values.services,
      });

      setSuccessMessage(
        `Agendamento criado com sucesso.\nStatus: Confirmado\nCanal: Telefone`,
      );

      window.setTimeout(() => {
        router.push(`/admin/agendamentos/${result.appointment.id}`);
      }, 900);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setSubmitError(mapAppointmentError(error));
        return;
      }

      if (error instanceof Error) {
        setSubmitError(error.message);
        return;
      }

      setSubmitError("Não foi possível criar o agendamento no momento.");
    }
  }

  if (isLoadingServices) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isServicesError) {
    return (
      <Alert severity="error" action={<Button onClick={() => void refetch()}>Tentar novamente</Button>}>
        Não foi possível carregar os serviços disponíveis.
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: "grid", gap: 3 }}>
      {submitError && <Alert severity="error">{submitError}</Alert>}

      {successMessage && (
        <Alert severity="success" sx={{ whiteSpace: "pre-line" }}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      1. Cliente
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pesquise um cliente existente ou cadastre um novo sem criar login.
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Button
                      type="button"
                      variant={clientMode === "existing" ? "contained" : "outlined"}
                      onClick={() => setClientMode("existing")}
                    >
                      Selecionar cliente existente
                    </Button>
                    <Button
                      type="button"
                      variant={clientMode === "new" ? "contained" : "outlined"}
                      onClick={() => {
                        setClientMode("new");
                        setClientSuccessMessage("");
                        setClientError("");
                      }}
                    >
                      + Novo cliente
                    </Button>
                  </Stack>

                  {clientSuccessMessage && <Alert severity="success">{clientSuccessMessage}</Alert>}
                  {clientError && <Alert severity="error">{clientError}</Alert>}

                  {selectedClient && (
                    <Alert severity="info">
                      Cliente selecionado: <strong>{selectedClient.name}</strong>
                      {" · "}
                      {formatPhone(selectedClient.phone)}
                      {selectedClient.email ? ` · ${selectedClient.email}` : ""}
                    </Alert>
                  )}

                  {errors.client_id && !selectedClient && (
                    <Typography color="error" variant="caption">
                      {errors.client_id.message}
                    </Typography>
                  )}

                  {clientMode === "existing" ? (
                    <Stack spacing={2}>
                      <TextField
                        label="Buscar por nome ou telefone"
                        fullWidth
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        helperText="Digite ao menos 2 caracteres. Telefone pode ser compartilhado por mais de um cliente."
                      />

                      {isSearching && (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      )}

                      {isSearchError && (
                        <Alert severity="error">Não foi possível buscar clientes no momento.</Alert>
                      )}

                      {!isSearching && debouncedSearch.trim().length >= 2 && searchResults.length === 0 && (
                        <Alert severity="info">
                          Nenhum cliente encontrado. Você pode cadastrar um novo cliente.
                        </Alert>
                      )}

                      {searchResults.length > 0 && (
                        <List sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, py: 0 }}>
                          {searchResults.map((client) => {
                            const isSelected = selectedClient?.id === client.id;

                            return (
                              <ListItemButton
                                key={client.id}
                                selected={isSelected}
                                onClick={() => handleSelectClient(client)}
                              >
                                <ListItemText
                                  primary={client.name}
                                  secondary={`${formatPhone(client.phone)}${client.email ? ` · ${client.email}` : ""}`}
                                />
                                {isSelected && <Chip size="small" label="Selecionado" color="primary" />}
                              </ListItemButton>
                            );
                          })}
                        </List>
                      )}
                    </Stack>
                  ) : (
                    <Stack
                      component="div"
                      spacing={2}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                        }
                      }}
                    >
                      <TextField
                        label="Nome"
                        fullWidth
                        required
                        {...newClientForm.register("name")}
                        error={Boolean(newClientForm.formState.errors.name)}
                        helperText={newClientForm.formState.errors.name?.message}
                      />
                      <TextField
                        label="Telefone"
                        fullWidth
                        required
                        {...newClientForm.register("phone")}
                        error={Boolean(newClientForm.formState.errors.phone)}
                        helperText={newClientForm.formState.errors.phone?.message}
                      />
                      <TextField
                        label="Email"
                        fullWidth
                        {...newClientForm.register("email")}
                        error={Boolean(newClientForm.formState.errors.email)}
                        helperText={
                          newClientForm.formState.errors.email?.message ||
                          "Opcional. Não cria conta de login."
                        }
                      />
                      <Button
                        type="button"
                        variant="contained"
                        disabled={isCreatingClient}
                        onClick={newClientForm.handleSubmit(handleCreateClient)}
                      >
                        {isCreatingClient ? "Criando cliente..." : "Criar cliente"}
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      2. Serviços
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Selecione um ou mais serviços ativos.
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {activeServices.map((service: ServiceItem) => {
                      const isSelected = selectedServiceIds.includes(service.id);

                      return (
                        <Grid key={service.id} size={{ xs: 12, sm: 6 }}>
                          <Card
                            variant={isSelected ? "elevation" : "outlined"}
                            sx={{
                              height: "100%",
                              borderColor: isSelected ? "primary.main" : "divider",
                              backgroundColor: isSelected ? "rgba(122, 63, 84, 0.04)" : "background.paper",
                            }}
                          >
                            <CardContent sx={{ display: "grid", gap: 1.5, height: "100%" }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {service.name}
                              </Typography>
                              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                                <Typography variant="caption" color="text.secondary">
                                  {service.duration_minutes} min
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                                  {formatPrice(service.price)}
                                </Typography>
                              </Stack>
                              <Button
                                type="button"
                                variant={isSelected ? "contained" : "outlined"}
                                onClick={() => handleToggleService(service.id)}
                              >
                                {isSelected ? "Remover" : "Selecionar"}
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {errors.services && (
                    <Typography color="error" variant="caption">
                      {errors.services.message}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      3. Data e horário
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Funcionamento: terça a sábado, das 09:00 às 19:00.
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      label="Data"
                      type="date"
                      fullWidth
                      value={selectedDate}
                      onChange={(event) => handleDateChange(event.target.value)}
                      error={Boolean(errors.scheduled_at) || Boolean(dateHelper)}
                      helperText={dateHelper || errors.scheduled_at?.message}
                      slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: { min: getTodayDateInputValue() },
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
                        htmlInput: { min: "09:00", max: "19:00", step: 300 },
                      }}
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ position: "sticky", top: 24 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  4. Resumo
                </Typography>

                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Cliente
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedClient?.name || "—"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Telefone: {formatPhone(selectedClient?.phone)}
                  </Typography>
                </Stack>

                <Divider />

                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Serviços
                  </Typography>
                  {selectedServices.length === 0 ? (
                    <Typography variant="body2">Nenhum serviço selecionado.</Typography>
                  ) : (
                    selectedServices.map((service) => (
                      <Stack
                        key={service.id}
                        direction="row"
                        sx={{ justifyContent: "space-between", gap: 2 }}
                      >
                        <Typography variant="body2">- {service.name}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatPrice(service.price)}
                        </Typography>
                      </Stack>
                    ))
                  )}
                </Stack>

                <Divider />

                <Stack spacing={1}>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Duração total
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDuration(totalDuration)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Data
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDisplayDate(selectedDate)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Horário
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDisplayTime(selectedTime)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Término
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {endsAtLabel}
                    </Typography>
                  </Stack>

                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {formatPrice(totalPrice)}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider />

                <Stack spacing={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Canal: Telefone
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: Confirmado
                  </Typography>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button type="button" variant="outlined" href="/admin/agendamentos" LinkComponent="a" fullWidth>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isCreatingAppointment || Boolean(successMessage)}
                  >
                    {isCreatingAppointment ? "Criando..." : "Criar agendamento"}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
