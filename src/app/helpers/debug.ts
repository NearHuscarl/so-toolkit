import _Debug from "debug"
import { __DEV__ } from "app/constants"

// wrapper of Debug. Only run in development mode
// you can turn on/off debug here instead of having to setup DEBUG variable and restart your dev-server everytime
export default function Debug(namespace: string) {
  if (__DEV__) {
    _Debug.enable(namespace)
  }
  return _Debug(namespace)
}
