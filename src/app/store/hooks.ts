import {
  useDispatch,
  shallowEqual,
  TypedUseSelectorHook,
  useSelector as useReduxSelector,
} from "react-redux";
import { RootState } from "app/store/store";

const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export { useSelector, useDispatch, shallowEqual };
