"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

import type { ServiceItem } from "@/features/services/types/service.types";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ServicesList({
  services,
  isLoading,
  isError,
  refetch,
}: {
  services?: ServiceItem[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}) {
  const router = useRouter();

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
        Não foi possível carregar os serviços no momento.
      </Alert>
    );
  }

  if (!services || services.length === 0) {
    return (
      <Alert severity="info">Nenhum serviço disponível no momento. Volte em breve.</Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {services.map((service) => (
        <Grid key={service.id} size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {service.name}
                </Typography>

                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {service.description || "Sem descrição adicional."}
                </Typography>

                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {service.duration_minutes} min
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                    {formatPrice(service.price)}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => router.push("/agendar")}
              >
                Agendar
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
