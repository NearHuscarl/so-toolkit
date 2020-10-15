import { SnackbarMessage, useSnackbar as useMuiSnackbar } from "notistack"
import { __PRODUCTION__ } from "app/constants"
import { useCallback } from "react"

/*
 * A wrapper of notistack's useSnackbar but with more sensible name that
 * hides the implementation detail (createSnackbar instead of enqueueSnackbar)
 * <br/>
 * Also add some extra helper functions to quickly create other types of snackbar
 */
export function useSnackbar() {
  const contextValue = useMuiSnackbar()
  if (!__PRODUCTION__) {
    if (!contextValue) {
      throw new Error(
        "could not find snackbar context value; please ensure the component is wrapped in a <SnackbarProvider>"
      )
    }
  }

  const { enqueueSnackbar, closeSnackbar } = contextValue
  const createSuccessSnackbar = useCallback(
    (message: SnackbarMessage) =>
      enqueueSnackbar(message, {
        variant: "success",
      }),
    [enqueueSnackbar]
  )
  const createWarningSnackbar = useCallback(
    (message: SnackbarMessage) =>
      enqueueSnackbar(message, {
        variant: "warning",
      }),
    [enqueueSnackbar]
  )
  const createErrorSnackbar = useCallback(
    (message: SnackbarMessage) =>
      enqueueSnackbar(message, {
        variant: "error",
      }),
    [enqueueSnackbar]
  )

  return {
    createSnackbar: enqueueSnackbar,
    createSuccessSnackbar,
    createWarningSnackbar,
    createErrorSnackbar,
    closeSnackbar,
  }
}
