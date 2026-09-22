"use client";

import { Alert, Snackbar, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";

export type NotificationSeverity = "success" | "error" | "warning" | "info";

export interface AppSnackbarProps {
  open: boolean;
  message: string;
  severity?: NotificationSeverity;
  autoHideDuration?: number | null;
  onClose: () => void;
}

export function AppSnackbar({
  open,
  message,
  severity = "info",
  autoHideDuration = 5000,
  onClose,
}: AppSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={(_event, reason) => {
        if (reason === "clickaway") return;
        onClose();
      }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      sx={{
        bottom: { xs: 16, sm: 24 },
        right: { xs: 16, sm: 24 },
        maxWidth: { xs: "calc(100vw - 32px)", sm: 420 },
      }}
    >
      <Alert
        severity={severity}
        variant="filled"
        onClose={onClose}
        action={
          <IconButton
            size="small"
            aria-label="fechar"
            color="inherit"
            onClick={onClose}
            sx={{ p: 0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          width: "100%",
          alignItems: "center",
          boxShadow: 4,
          borderRadius: 2,
          fontWeight: 500,
          "& .MuiAlert-message": {
            py: 0.5,
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
