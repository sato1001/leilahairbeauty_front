"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ServiceForm } from "@/features/services/components/ServiceForm";
import type { ServiceFormValues } from "@/features/services/schemas/service.schema";
import { servicesService } from "@/features/services/services/service.service";

export default function EditServicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [service, setService] = useState<ServiceFormValues | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadService() {
      try {
        const id = Number(params.id);
        const currentService = await servicesService.getById(id);
        setService({
          name: currentService.name,
          description: currentService.description ?? "",
          duration_minutes: currentService.duration_minutes,
          price: currentService.price,
        });
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Não foi possível carregar o serviço.");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      void loadService();
    }
  }, [params.id]);

  async function handleSubmit(values: ServiceFormValues) {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await servicesService.update(Number(params.id), {
        name: values.name,
        description: values.description || undefined,
        duration_minutes: values.duration_minutes,
        price: values.price,
      });

      router.push("/admin/servicos");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível atualizar o serviço.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!service) {
    return (
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Serviço não encontrado.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        Editar serviço
      </Typography>

      <ServiceForm
        defaultValues={service}
        submitLabel="Salvar alterações"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        cancelHref="/admin/servicos"
      />
    </Box>
  );
}
