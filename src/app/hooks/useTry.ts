import { useCallback } from "react"
import { useSnackbar } from "./useSnackbar"
import { getApiError } from "app/helpers"

export function useTry() {
  const { createErrorSnackbar } = useSnackbar()

  return useCallback(
    async <T>(fn: (...args) => Promise<T>) => {
      let result: T | undefined = undefined

      try {
        result = await fn()
      } catch (e) {
        const error = getApiError(e)
        createErrorSnackbar(error.message)
      }

      return result
    },
    [createErrorSnackbar]
  )
}
