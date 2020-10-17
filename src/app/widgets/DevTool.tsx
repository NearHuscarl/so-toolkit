import React from "react"
import Button from "@material-ui/core/Button"
import { __DEV__ } from "app/constants"
import { devToolActions, useDispatch, useSelector, useStore } from "app/store"
import { useSeApi } from "app/hooks"
import { createApi } from "app/helpers"
import { FormControlLabel, Checkbox } from "@material-ui/core"

function useMockedApi() {
  const store = useStore()
  if (__DEV__) {
    const { getApi } = require("../test/api")
    return (mock: boolean) => {
      if (mock) {
        return getApi(store, { apiResponseDelay: 350 })
      } else {
        return createApi(store)
      }
    }
  }
  return undefined
}

export function DevTool() {
  const isUsingMockedApi = useSelector((state) => state.devTool.useMockedApi)
  const dispatch = useDispatch()
  const mockApi = useMockedApi()
  const api = useSeApi()
  const enableMockedApi = (enable: boolean) => {
    const { userService } = api

    userService.API = mockApi?.(enable)
  }

  React.useEffect(() => {
    if (__DEV__ && isUsingMockedApi) {
      enableMockedApi(true)
    }
  }, [])

  if (!__DEV__) return null

  const onToggleMockApi = (_, value: boolean) => {
    enableMockedApi(value)
    dispatch(devToolActions.useMockedApi(value))
  }
  const onDeleteCache = () => {
    localStorage.removeItem("persist:user")
  }

  return (
    <div style={{ position: "absolute", bottom: 10, left: 10 }}>
      <FormControlLabel
        control={
          <Checkbox
            name="mockApi"
            checked={isUsingMockedApi}
            onChange={onToggleMockApi}
          />
        }
        label="Mock API"
      />
      <Button onClick={onDeleteCache}>Delete Cache</Button>
    </div>
  )
}
