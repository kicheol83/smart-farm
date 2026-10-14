import { createTheme, type ThemeOptions, type PaletteMode } from "@mui/material/styles";

export const GRADIENT_GREEN =
  "linear-gradient(146.72deg, #35C56E 19.38%, #2E9055 91.38%)";
export const GRADIENT_GREEN_DARK =
  "linear-gradient(146.72deg, #2DA85E 19.38%, #227042 91.38%)";
export const GRADIENT_DARK =
  "linear-gradient(141.98deg, #666666 4.79%, #1A1A1A 95.21%)";
export const GRADIENT_DARK_MODE =
  "linear-gradient(141.98deg, #4A4A4A 4.79%, #0C0C0C 95.21%)";

export const GRADIENT_LOGIN_BUTTON =
  "linear-gradient(175.69deg, #666666 4.79%, #1A1A1A 95.21%)";
export const GRADIENT_LOGIN_BUTTON_DARK =
  "linear-gradient(175.69deg, #4A4A4A 4.79%, #0C0C0C 95.21%)";

export const GRADIENT_ONBOARDING_OVERLAY =
  "linear-gradient(180deg, rgba(53,197,110,0) 53.31%, rgba(46,144,85,0.82) 71.49%, rgba(46,144,85,0.93) 76.02%, rgba(46,144,85,1) 83.57%)";

export const LOGIN_BG_LIGHT = "#dcdcdc";
export const LOGIN_BG_DARK = "#141414";

const baseOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Satoshi", "Roboto", "Helvetica", "Arial", sans-serif',
    h2: { fontSize: 40, fontWeight: 500, lineHeight: 1.4, letterSpacing: -0.8 },
    h4: { fontSize: 32, fontWeight: 400, lineHeight: 1.4, letterSpacing: -0.64 },
    h5: { fontSize: 24, fontWeight: 500, lineHeight: 1.4, letterSpacing: -0.48 },
    subtitle1: { fontSize: 16, fontWeight: 700, lineHeight: 1.6, letterSpacing: -0.32 },
    body1: { fontSize: 14, fontWeight: 500, lineHeight: 1.6, letterSpacing: -0.28 },
    body2: { fontSize: 12, fontWeight: 400, lineHeight: 1.6, letterSpacing: -0.24 },
    caption: { fontSize: 10, fontWeight: 500, lineHeight: 1.6, letterSpacing: -0.2 },
    button: { textTransform: "none", fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 4,
};

const lightPalette: ThemeOptions["palette"] = {
  mode: "light",
  primary: {
    main: "#35C56E",
    dark: "#2E9055",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#333333",
  },
  warning: {
    main: "#f9ad19",
  },
  background: {
    default: "#ffffff",
    paper: "#ececec",
  },
  text: {
    primary: "#333333",
    secondary: "#a4a4a4",
  },
  divider: "#dcdcdc",
  action: {
    hover: "#eaeaea",
    selected: "#f4f4f4",
  },
};

const darkPalette: ThemeOptions["palette"] = {
  mode: "dark",
  primary: {
    main: "#2DA85E",
    dark: "#227042",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#f5f5f5",
  },
  warning: {
    main: "#f9ad19",
  },
  background: {
    default: "#121212",
    paper: "#1c1c1c",
  },
  text: {
    primary: "#f5f5f5",
    secondary: "#9c9c9c",
  },
  divider: "#404040",
  action: {
    hover: "#2e2e2e",
    selected: "#262626",
  },
};

export function buildTheme(mode: PaletteMode) {
  return createTheme({
    ...baseOptions,
    palette: mode === "light" ? lightPalette : darkPalette,
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });
}
