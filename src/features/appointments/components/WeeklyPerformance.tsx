"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { useWeeklyPerformance } from "@/features/appointments/hooks/useWeeklyPerformance";
import type { WeeklyPerformanceResponse } from "@/features/appointments/types/appointment.types";

function getSaoPauloParts(date: Date) {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const [year, month, day] = formatted.split("-").map(Number);
  return { year, month, day };
}

function formatDateValue(dateValue: string, includeYear = true) {
  const date = new Date(`${dateValue}T00:00:00-03:00`);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: includeYear ? "numeric" : undefined,
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function formatDateRange(dateValue: string) {
  const start = new Date(`${dateValue}T12:00:00-03:00`);
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);

  const startLabel = formatDateValue(dateValue);
  const endLabel = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(end);

  return `${startLabel} — ${endLabel}`;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getMondayOfCurrentWeek(date = new Date()): string {
  const { year, month, day } = getSaoPauloParts(date);
  const dateUtc = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = dateUtc.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayUtc = new Date(Date.UTC(year, month - 1, day + diffToMonday));

  const mondayYear = mondayUtc.getUTCFullYear();
  const mondayMonth = String(mondayUtc.getUTCMonth() + 1).padStart(2, "0");
  const mondayDay = String(mondayUtc.getUTCDate()).padStart(2, "0");

  return `${mondayYear}-${mondayMonth}-${mondayDay}`;
}

function getWeekDateValue(value: string, offsetDays: number) {
  const date = new Date(`${value}T12:00:00-03:00`);
  const shifted = new Date(date.getTime() + offsetDays * 24 * 60 * 60 * 1000);

  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function MetricCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={1} sx={{ minHeight: 154, justifyContent: "center" }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {value}
          </Typography>
          {sublabel ? (
            <Typography variant="body2" color="text.secondary">
              {sublabel}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function WeeklyPerformance() {
  const [weekStart, setWeekStart] = useState<string>("");
  const { data, isLoading, isError, refetch } = useWeeklyPerformance(weekStart);

  useEffect(() => {
    setWeekStart(getMondayOfCurrentWeek());
  }, []);

  const weekMeta = useMemo(() => {
    if (!weekStart) {
      return { range: "Carregando...", start: "", end: "" };
    }

    const start = weekStart;
    const end = getWeekDateValue(weekStart, 6);

    return {
      range: `${formatDateRange(start)}`,
      start,
      end,
    };
  }, [weekStart]);

  const summary = data?.summary ?? { confirmed: 0, completed: 0, cancelled: 0 };
  const revenue = data?.revenue ?? 0;
  const mostBookedService = data?.most_booked_service ?? null;

  function handlePreviousWeek() {
    setWeekStart((current) => getWeekDateValue(current, -7));
  }

  function handleNextWeek() {
    setWeekStart((current) => getWeekDateValue(current, 7));
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, mb: 3 }}
      >
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
          Desempenho semanal
        </Typography>

        <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "center" }}>
          <Button variant="outlined" size="small" onClick={handlePreviousWeek} aria-label="Semana anterior">
            <ChevronLeftIcon />
          </Button>
          <Typography variant="body1" sx={{ minWidth: 220, textAlign: "center", fontWeight: 600 }}>
            {weekMeta.range}
          </Typography>
          <Button variant="outlined" size="small" onClick={handleNextWeek} aria-label="Próxima semana">
            <ChevronRightIcon />
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="40%" height={26} />
                  <Skeleton variant="rectangular" height={64} sx={{ mt: 2, borderRadius: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Não foi possível carregar o desempenho semanal. Tente novamente.
          <Button color="inherit" size="small" sx={{ ml: 2 }} onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </Alert>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard label="Confirmados" value={summary.confirmed} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard label="Concluídos" value={summary.completed} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard label="Cancelados" value={summary.cancelled} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard label="Faturamento" value={formatPrice(revenue)} />
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack spacing={1} sx={{ minHeight: 154, justifyContent: "center" }}>
                  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.5 }}>
                    Serviço mais agendado
                  </Typography>
                  {mostBookedService ? (
                    <>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {mostBookedService.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {mostBookedService.quantity} agendamentos
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="h6" color="text.secondary">
                      Nenhum serviço agendado
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
