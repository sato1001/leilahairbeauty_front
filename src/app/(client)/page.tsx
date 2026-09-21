"use client";

import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import Link from "next/link";

interface StoredUser {
  name?: string;
  email?: string;
}

export default function ClientHomePage() {
  const getInitialUserName = () => {
    try {
      const rawUser = localStorage.getItem("leila_auth_user");
      if (!rawUser) {
        return "Cliente";
      }

      const user = JSON.parse(rawUser) as StoredUser;
      return user.name ? user.name.split(" ")[0] : "Cliente";
    } catch {
      return "Cliente";
    }
  };

  const userName = getInitialUserName();

  return (
    <Box>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        Olá, {userName}!
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        O que você deseja fazer?
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Agendar um serviço
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Escolha o melhor horário para o seu cuidado.
            </Typography>
            <Button component={Link} href="/agendar" variant="contained">
              Agendar
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Ver meus agendamentos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Acompanhe seus horários e compromissos.
            </Typography>
            <Button component={Link} href="/meus-agendamentos" variant="outlined">
              Ver agenda
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Ver serviços
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Explore os tratamentos disponíveis.
            </Typography>
            <Button component={Link} href="/servicos" variant="contained" color="secondary">
              Serviços
            </Button>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
