"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";

import { WeeklyPerformance } from "@/features/appointments/components/WeeklyPerformance";

export default function AdminDashboardPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        Bem-vindo, Leila
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Aqui você pode gerenciar os serviços e acompanhar a operação do salão.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Serviços
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Crie, edite e desative serviços disponíveis para o catálogo do salão.
                </Typography>
                <Button component={Link} href="/admin/servicos" variant="contained">
                  Gerenciar serviços
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Agendamentos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Consulte e acompanhe os agendamentos do salão em tempo real.
                </Typography>
                <Button component={Link} href="/admin/agendamentos" variant="outlined">
                  Consultar agenda
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <WeeklyPerformance />
    </Box>
  );
}
