import { Chip } from "@mui/material";

const labelMap: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

const colorMap: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  CONFIRMED: "primary",
  COMPLETED: "success",
  CANCELLED: "error",
};

export function AppointmentStatusBadge({ status }: { status: string }) {
  const label = labelMap[status] ?? status;
  const color = colorMap[status] ?? "default";

  return <Chip label={label} color={color} size="small" />;
}
