"use client";

import { AppointmentEditorForm } from "@/features/appointments/components/AppointmentEditorForm";
import { useAppointment } from "@/features/appointments/hooks/useAppointments";
import { Alert, Box, CircularProgress } from "@mui/material";
import { useParams } from "next/navigation";

export default function AdminAppointmentEditPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id ?? 0);
  const { data, isLoading, isError } = useAppointment(id);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data?.appointment) {
    return <Alert severity="error">Não foi possível carregar os dados do agendamento.</Alert>;
  }

  return (
    <AppointmentEditorForm
      appointment={data.appointment}
      successRedirectUrl={`/admin/agendamentos/${data.appointment.id}`}
    />
  );
}
