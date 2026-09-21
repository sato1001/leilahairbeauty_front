"use client";

import { Box, Typography } from "@mui/material";

import { ServicesList } from "@/features/services/components/ServicesList";
import { useServices } from "@/features/services/hooks/useServices";

export default function ClientServicesPage() {
  const { data, isLoading, isError, refetch } = useServices();

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        Serviços disponíveis
      </Typography>

      <ServicesList
        services={data ?? []}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
      />
    </Box>
  );
}
