"use client";

import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ServiceForm } from "@/features/services/components/ServiceForm";
import { servicesService } from "@/features/services/services/service.service";
import type { ServiceFormValues } from "@/features/services/schemas/service.schema";
import { useNotification } from "@/components/providers/NotificationProvider";

export default function NewServicePage() {
  const router = useRouter();
  const { notify } = useNotification();
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: ServiceFormValues) {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await servicesService.create({
        name: values.name,
        description: values.description || undefined,
        duration_minutes: values.duration_minutes,
        price: values.price,
      });

      notify({ severity: "success", message: "Serviço criado com sucesso." });
      router.push("/admin/servicos");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível criar o serviço.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        Novo serviço
      </Typography>

      <ServiceForm
        submitLabel="Salvar serviço"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        cancelHref="/admin/servicos"
      />
    </Box>
  );
}
