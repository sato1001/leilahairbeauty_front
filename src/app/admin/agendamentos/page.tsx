"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import type { AppointmentDetailResponse } from "@/features/appointments/types/appointment.types";

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Pendente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "COMPLETED", label: "Concluído" },
  { value: "CANCELLED", label: "Cancelado" },
];

const channelLabels: Record<string, string> = {
  ONLINE: "Online",
  PHONE: "Telefone",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function AdminAppointmentsPage() {
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const query = useMemo(
    () => ({
      page,
      limit,
      status: status || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    }),
    [endDate, limit, page, startDate, status],
  );

  const { data, isLoading, isError, refetch } = useAppointments(query);

  const appointments = data?.appointments ?? [];
  const pagination = data?.pagination;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
  }

  function handleClearFilters() {
    setStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Agendamentos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualize a agenda do salão e use os filtros do backend para localizar um agendamento.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button component={Link} href="/admin/agendamentos/novo" variant="contained">
            Novo agendamento
          </Button>
          <Button component={Link} href="/admin" variant="outlined">
            Voltar ao dashboard
          </Button>
        </Stack>
      </Stack>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { xs: "stretch", md: "flex-end" } }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="admin-appointment-status">Status</InputLabel>
            <Select
              labelId="admin-appointment-status"
              value={status}
              label="Status"
              onChange={(event) => setStatus(event.target.value)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value || "all"} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Data inicial"
            type="date"
            size="small"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Data final"
            type="date"
            size="small"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Button type="submit" variant="contained">
            Filtrar
          </Button>

          <Button type="button" variant="text" onClick={handleClearFilters}>
            Limpar
          </Button>
        </Stack>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" action={<Button onClick={() => void refetch()}>Tentar novamente</Button>}>
          Não foi possível carregar os agendamentos no momento.
        </Alert>
      ) : appointments.length === 0 ? (
        <Alert severity="info">Nenhum agendamento encontrado para os filtros selecionados.</Alert>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 1100 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Horário</TableCell>
                  <TableCell>Serviços</TableCell>
                  <TableCell>Duração</TableCell>
                  <TableCell>Valor total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Canal</TableCell>
                  <TableCell align="right">Ação</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {appointments.map((appointment: AppointmentDetailResponse) => (
                  <TableRow key={appointment.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {appointment.client.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {appointment.client.email}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>{formatDate(appointment.scheduled_at)}</TableCell>

                    <TableCell>
                      {formatDateTime(appointment.scheduled_at)}
                      <Typography variant="caption" color="text.secondary" component="div">
                        até {formatDateTime(appointment.ends_at)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {appointment.services.length > 0 ? (
                        appointment.services.map((item) => item.service_name).join(", ")
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell>{appointment.duration} min</TableCell>
                    <TableCell>{formatPrice(appointment.total)}</TableCell>

                    <TableCell>
                      <AppointmentStatusBadge status={appointment.status} />
                    </TableCell>

                    <TableCell>{channelLabels[appointment.channel] ?? appointment.channel}</TableCell>

                    <TableCell align="right">
                      <Button component={Link} href={`/admin/agendamentos/${appointment.id}`} variant="outlined" size="small">
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination && pagination.total_pages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={pagination.total_pages}
                page={page}
                onChange={(_, nextPage) => setPage(nextPage)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
