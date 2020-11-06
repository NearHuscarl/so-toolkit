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

export type PromiseFn<T extends any = any> = (...args) => Promise<T>
type ThenArg<F> = F extends Promise<infer U> ? U : unknown

export function useTry<F extends PromiseFn, T extends ThenArg<ReturnType<F>>>(
  promiseFn: F,
  option?: TryProps
) {
  const { errorSnackbar = true } = option || {}
  const { createErrorSnackbar } = useSnackbar()
  const [state, setState] = useState<AsyncState<T>>({ isPending: false })
  const $try = useCallback(
    async (...args: Parameters<F>) => {
      let data: T | undefined = undefined
      try {
        setState((s) => ({ ...s, isPending: true }))
        data = await promiseFn(...args)
        setState((s) => ({ ...s, isPending: false, data }))
      } catch (e) {
        const error = getApiError(e)
        setState((s) => ({ ...s, isPending: false, error }))
        console.error(e)
        if (errorSnackbar) {
          createErrorSnackbar(error.message)
        }
      }

      return data
    },
    [createErrorSnackbar, errorSnackbar, promiseFn]
  ) as F

  return useMemo(() => ({ ...state, $try }), [$try, state])
}
