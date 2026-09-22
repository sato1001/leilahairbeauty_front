"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { serviceFormSchema, type ServiceFormValues } from "@/features/services/schemas/service.schema";

export function ServiceForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isSubmitting,
  submitError,
  cancelHref,
}: {
  defaultValues?: Partial<ServiceFormValues>;
  submitLabel: string;
  onSubmit: (values: ServiceFormValues) => Promise<void> | void;
  isSubmitting: boolean;
  submitError?: string;
  cancelHref: string;
}) {
  const form = useForm({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      duration_minutes: Number(defaultValues?.duration_minutes ?? 30),
      price: Number(defaultValues?.price ?? 0),
    },
  });

  useEffect(() => {
    form.reset({
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      duration_minutes: Number(defaultValues?.duration_minutes ?? 30),
      price: Number(defaultValues?.price ?? 0),
    });
  }, [defaultValues, form]);

  return (
    <Box component="form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Dados do serviço
              </Typography>
            </Box>

            {submitError && (
              <Alert severity="error">{submitError}</Alert>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Nome"
                  fullWidth
                  {...form.register("name")}
                  error={Boolean(form.formState.errors.name)}
                  helperText={form.formState.errors.name?.message}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Descrição"
                  fullWidth
                  multiline
                  minRows={3}
                  {...form.register("description")}
                  error={Boolean(form.formState.errors.description)}
                  helperText={form.formState.errors.description?.message}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Duração em minutos"
                  type="number"
                  fullWidth
                  slotProps={{ htmlInput: { min: 1, step: 1 } }}
                  {...form.register("duration_minutes")}
                  error={Boolean(form.formState.errors.duration_minutes)}
                  helperText={form.formState.errors.duration_minutes?.message}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Preço"
                  type="number"
                  fullWidth
                  slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                  {...form.register("price")}
                  error={Boolean(form.formState.errors.price)}
                  helperText={form.formState.errors.price?.message}
                />
              </Grid>
            </Grid>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "flex-end" }}>
              <Button type="button" variant="outlined" href={cancelHref} LinkComponent="a">
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : submitLabel}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
