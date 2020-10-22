import React, { useRef } from "react"
import Button from "@material-ui/core/Button"
import MockAdapter from "axios-mock-adapter"
import { __DEV__ } from "app/constants"
import { devToolActions, useDispatch, useSelector } from "app/store"
import { useAxios } from "app/hooks"
import { FormControlLabel, Checkbox } from "@material-ui/core"

function useMockedApi() {
  const api = useAxios()
  const apiMockRef = useRef<MockAdapter>()

  if (__DEV__) {
    const { applyApiMock } = require("../test/api")
    return (mock: boolean) => {
      if (mock) {
        apiMockRef.current = applyApiMock(api, { apiResponseDelay: 420 })
      } else {
        apiMockRef.current?.restore()
      }
    }
  }
  return () => void 0
}

export function DevTool() {
  const isUsingMockedApi = useSelector((state) => state.devTool.useMockedApi)
  const accessToken = useSelector((state) => state.auth.accessToken)
  const dispatch = useDispatch()
  const mockApi = useMockedApi()

  React.useEffect(() => {
    if (__DEV__ && isUsingMockedApi) {
      mockApi(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!__DEV__) return null

  const onToggleMockApi = (_, value: boolean) => {
    mockApi(value)
    dispatch(devToolActions.useMockedApi(value))
  }
  const onDeleteCache = () => {
    localStorage.removeItem("persist:user")
    // TODO: purge persist cache in memory
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
      <span style={{ fontSize: 9.5, marginLeft: 15 }}>
        {accessToken ?? "null"}
      </span>
    </div>
  )
}
