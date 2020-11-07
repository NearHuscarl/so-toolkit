import React, { PropsWithChildren } from "react"
import MuiThemeProvider from "@material-ui/styles/ThemeProvider"
import { theme } from "app/styles"

export function ThemeProvider(props: PropsWithChildren<{}>) {
  const { children } = props
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
}
