import React, { PropsWithChildren } from "react"
import { createMuiTheme, Theme } from "@material-ui/core/styles"
import MuiThemeProvider from "@material-ui/styles/ThemeProvider"

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

export function ThemeProvider(props: PropsWithChildren<{}>) {
  const { children } = props

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
}
