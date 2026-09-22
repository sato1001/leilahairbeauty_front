"use client";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas/register.schema";
import { authService } from "@/features/auth/services/auth.service";
import { useNotification } from "@/components/providers/NotificationProvider";
import { ApiClientError } from "@/lib/api/client";

export function RegisterForm() {
  const router = useRouter();
  const { notify } = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone?.trim() ? data.phone.trim() : null,
        password: data.password,
      };

      await authService.register(payload);

      notify({
        severity: "success",
        message: "Conta criada com sucesso. Faça login para continuar.",
      });

      router.push("/login?registered=true");
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Não foi possível criar a conta no momento.";
      setSubmitError(message);
      notify({
        severity: "error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        {submitError && <Alert severity="error">{submitError}</Alert>}

        <TextField
          label="Nome completo"
          autoComplete="name"
          placeholder="Seu nome"
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          {...register("name")}
        />

        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register("email")}
        />

        <TextField
          label="Telefone/WhatsApp"
          autoComplete="tel"
          placeholder="(18) 99999-9999"
          error={Boolean(errors.phone)}
          helperText={errors.phone?.message}
          {...register("phone")}
        />

        <TextField
          label="Senha"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Alternar visibilidade da senha"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          {...register("password")}
        />

        <TextField
          label="Confirmar senha"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repita sua senha"
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Alternar visibilidade da confirmação da senha"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          {...register("confirmPassword")}
        />

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </Button>

        <Typography variant="body2" color="text.secondary" align="center">
          Já possui conta?{" "}
          <Link href="/login" underline="hover" sx={{ fontWeight: 600, color: "primary.main" }}>
            Entrar
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
}
