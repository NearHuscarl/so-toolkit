import { useCallback, useEffect, useRef } from "react"

export function useIsMounted() {
  const isMountedRef = useRef(true)
  const isMounted = useCallback(() => isMountedRef.current, [])

  useEffect(() => {
    isMountedRef.current = true
    return () => void (isMountedRef.current = false)
  }, [])

  return isMounted
}
