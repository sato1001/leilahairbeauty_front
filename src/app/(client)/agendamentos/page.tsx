"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AppointmentCard } from "@/features/appointments/components/AppointmentCard";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Pendente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "COMPLETED", label: "Concluído" },
  { value: "CANCELLED", label: "Cancelado" },
];

export default function MyAppointmentsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(6);

  const query = useMemo(
    () => ({
      page,
      limit,
      status: status || undefined,
    }),
    [limit, page, status],
  );

  const { data, isLoading, isError, refetch } = useAppointments(query);

  const appointments = data?.appointments ?? [];
  const pagination = data?.pagination;

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Meus agendamentos
          </Typography>
        </Box>

        <Button component={Link} href="/agendar" variant="contained">
          Agendar novo
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="appointment-status-filter">Status</InputLabel>
          <Select
            labelId="appointment-status-filter"
            value={status}
            label="Status"
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value || "all"} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" action={<Button onClick={() => refetch()}>Tentar novamente</Button>}>
          Não foi possível carregar seus agendamentos.
        </Alert>
      ) : appointments.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Você ainda não possui agendamentos.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Agende seu próximo atendimento e acompanhe tudo aqui.
          </Typography>
          <Button component={Link} href="/agendar" variant="contained">
            Agendar um serviço
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {appointments.map((appointment) => (
              <Grid key={appointment.id} size={{ xs: 12, md: 6 }}>
                <AppointmentCard appointment={appointment} />
              </Grid>
            ))}
          </Grid>

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
