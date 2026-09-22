"use client";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import HelpIcon from "@mui/icons-material/Help";

export type ModalType = "success" | "error" | "warning" | "info" | "confirm";
export type ButtonColor = "primary" | "secondary" | "error" | "warning" | "info" | "success" | "inherit";

export interface ModalProps {
  open: boolean;
  type?: ModalType;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: ButtonColor;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

const typeConfig: Record<
  ModalType,
  {
    icon: React.ReactNode;
    defaultColor: ButtonColor;
  }
> = {
  success: {
    icon: <CheckCircleIcon sx={{ fontSize: 44, color: "success.main" }} />,
    defaultColor: "success",
  },
  error: {
    icon: <ErrorIcon sx={{ fontSize: 44, color: "error.main" }} />,
    defaultColor: "error",
  },
  warning: {
    icon: <WarningIcon sx={{ fontSize: 44, color: "warning.main" }} />,
    defaultColor: "warning",
  },
  info: {
    icon: <InfoIcon sx={{ fontSize: 44, color: "info.main" }} />,
    defaultColor: "primary",
  },
  confirm: {
    icon: <HelpIcon sx={{ fontSize: 44, color: "primary.main" }} />,
    defaultColor: "primary",
  },
};

export function AppModal({
  open,
  type = "confirm",
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Voltar",
  confirmColor,
  onConfirm,
  onCancel,
  loading = false,
}: ModalProps) {
  const config = typeConfig[type] || typeConfig.confirm;
  const isConfirm = type === "confirm" || type === "warning" || type === "error";
  const resolvedButtonColor = confirmColor || config.defaultColor;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      aria-labelledby="app-modal-title"
      aria-describedby="app-modal-message"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: { xs: 1, sm: 1.5 },
          },
        },
      }}
    >
      <DialogTitle id="app-modal-title" sx={{ textAlign: "center", pb: 1, pt: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
          {config.icon}
        </Box>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", pb: 2 }}>
        <Typography
          id="app-modal-message"
          variant="body1"
          color="text.secondary"
          sx={{ whiteSpace: "pre-line" }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", gap: 1.5, pb: 2, px: 2 }}>
        {isConfirm ? (
          <>
            <Button
              onClick={onCancel}
              disabled={loading}
              variant="outlined"
              color="inherit"
              sx={{ minWidth: 100 }}
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              variant="contained"
              color={resolvedButtonColor}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ minWidth: 100 }}
            >
              {confirmLabel}
            </Button>
          </>
        ) : (
          <Button
            onClick={onCancel}
            disabled={loading}
            variant="contained"
            color={resolvedButtonColor}
            sx={{ minWidth: 100 }}
          >
            Fechar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
