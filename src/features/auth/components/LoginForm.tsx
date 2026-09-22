"use client";

import { Alert, Box, Button, IconButton, InputAdornment, Link, Stack, TextField, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { authService } from "@/features/auth/services/auth.service";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/login.schema";
import { ApiClientError } from "@/lib/api/client";

export function LoginForm({ registered = false }: { registered?: boolean }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await authService.login(data);
      localStorage.setItem("leila_auth_token", response.token);
      localStorage.setItem("leila_auth_user", JSON.stringify(response.user));

      const destination = response.user.role === "ADMIN" ? "/admin" : "/";
      router.push(destination);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setSubmitError(error.message);
        return;
      }

      setSubmitError("Não foi possível fazer login no momento.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        {registered && (
          <Alert severity="success">Conta criada com sucesso. Faça login para continuar.</Alert>
        )}

        {submitError && <Alert severity="error">{submitError}</Alert>}

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
          label="Senha"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Sua senha"
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

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>

        <Typography variant="body2" color="text.secondary" align="center">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" underline="hover" sx={{ fontWeight: 600, color: "primary.main" }}>
            Cadastre-se
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
}
