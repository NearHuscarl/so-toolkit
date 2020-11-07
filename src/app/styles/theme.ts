import { createMuiTheme, Theme } from "@material-ui/core/styles"

export type MyTheme = Theme & {
  app: {
    badge: {
      gold: string
      silver: string
      bronze: string
    }
  }
}

export const theme: MyTheme = createMuiTheme({
  palette: {
    text: {
      primary: "#000000ab",
      // secondary: "#00000",
    },
  },
  props: {
    MuiTextField: {
      variant: "outlined",
    },
    MuiButton: {
      variant: "contained",
    },
  },
  overrides: {
    MuiTab: {
      root: {
        fontWeight: 600,
      },
    },
  },

  // @ts-ignore
  app: {
    badge: {
      gold: "#f1b600",
      silver: "#9a9c9f",
      bronze: "#ab825f",
    },
  },
}) as any
