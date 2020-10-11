import {
  useDispatch,
  shallowEqual,
  TypedUseSelectorHook,
  useSelector as useReduxSelector,
} from "react-redux"
import { RootState, AppStore } from "app/store/store"
import { useStore as useReduxStore } from "react-redux"

const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector
const useStore = (): AppStore => useReduxStore<RootState>()

export { useStore, useSelector, useDispatch, shallowEqual }
