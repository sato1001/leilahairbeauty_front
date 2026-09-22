"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { servicesService } from "@/features/services/services/service.service";

export default function AdminServicesPage() {
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState("");

  const { data: services = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-services"],
    queryFn: () => servicesService.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (serviceId: number) => servicesService.remove(serviceId),
    onSuccess: () => {
      setDeleteError("");
      void queryClient.invalidateQueries({ queryKey: ["admin-services"] });
    },
    onError: (error) => {
      setDeleteError(error instanceof Error ? error.message : "Não foi possível desativar o serviço.");
    },
  });

  async function handleDelete(serviceId: number) {
    if (!confirm("Deseja desativar este serviço? Esta ação é permanente no catálogo público.")) {
      return;
    }

    setDeleteError("");
    deleteMutation.mutate(serviceId);
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Serviços
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crie, edite e mantenha o catálogo do salão.
          </Typography>
        </Box>

        <Button component={Link} href="/admin/servicos/novo" variant="contained">
          Novo serviço
        </Button>
      </Stack>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {deleteError}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" action={<Button onClick={() => void refetch()}>Tentar novamente</Button>}>
          Não foi possível carregar os serviços.
        </Alert>
      ) : services.length === 0 ? (
        <Alert severity="info">Nenhum serviço cadastrado no momento.</Alert>
      ) : (
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid key={service.id} size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(122,63,84,0.12)", backgroundColor: "#fff", height: "100%" }}>
                <Stack spacing={2} sx={{ height: "100%" }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {service.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {service.description || "Sem descrição adicional."}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {service.duration_minutes} min
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(service.price)}
                    </Typography>
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: "auto" }}>
                    <Button component={Link} href={`/admin/servicos/${service.id}/editar`} variant="outlined" fullWidth>
                      Editar
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      fullWidth
                      disabled={deleteMutation.isPending && deleteMutation.variables === service.id}
                      onClick={() => void handleDelete(service.id)}
                    >
                      {deleteMutation.isPending && deleteMutation.variables === service.id ? "Desativando..." : "Desativar"}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
