import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#7a3f54",
      light: "#b77c8d",
      dark: "#582536",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f5d4b6",
      light: "#fdeee7",
      dark: "#d9a77a",
      contrastText: "#2a1d1d",
    },
    background: {
      default: "#f7f3f2",
      paper: "#ffffff",
    },
    text: {
      primary: "#2d1f2b",
      secondary: "#6b5962",
    },
    error: {
      main: "#c73d52",
    },
    success: {
      main: "#2e7d5a",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    h1: { fontWeight: 700, letterSpacing: "-0.04em" },
    h2: { fontWeight: 700, letterSpacing: "-0.03em" },
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          minHeight: 48,
          boxShadow: "none",
          paddingInline: 22,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 14,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: "0px 18px 45px rgba(85, 58, 66, 0.08)",
        },
      },
    },
  },
});

export default theme;
