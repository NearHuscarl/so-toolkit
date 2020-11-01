import { useCallback, useMemo, useState } from "react"
import { useSnackbar } from "./useSnackbar"
import { getApiError } from "app/helpers"

export type AsyncState<T> = {
  data?: T
  error?: Error
  isPending: boolean
}

export type TryProps = {
  errorSnackbar: boolean
}

export type PromiseFn<T> = (...args) => Promise<T>

export function useTry<T>(promiseFn: PromiseFn<T>, option?: TryProps) {
  const { errorSnackbar = true } = option || {}
  const { createErrorSnackbar } = useSnackbar()
  const [state, setState] = useState<AsyncState<T>>({ isPending: false })
  const $try = useCallback(async () => {
    let data: T | undefined = undefined
    try {
      setState((s) => ({ ...s, isPending: true }))
      data = await promiseFn()
      setState((s) => ({ ...s, isPending: false, data }))
    } catch (e) {
      const error = getApiError(e)
      setState((s) => ({ ...s, isPending: false, error }))
      if (errorSnackbar) {
        createErrorSnackbar(error.message)
      }
    }

    return data
  }, [createErrorSnackbar, errorSnackbar, promiseFn])

  return useMemo(() => ({ ...state, $try }), [$try, state])
}
