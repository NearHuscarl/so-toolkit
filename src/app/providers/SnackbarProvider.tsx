import React from "react"
import {
  SnackbarProvider as MuiSnackbarProvider,
  SnackbarProviderProps,
} from "notistack"

export function SnackbarProvider(props: SnackbarProviderProps) {
  return (
    <MuiSnackbarProvider
      {...props}
      maxSnack={1}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
    />
  )
}
