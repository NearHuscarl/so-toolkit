import React, { useRef } from "react"
import Button from "@material-ui/core/Button"
import MockAdapter from "axios-mock-adapter"
import { __DEV__, NO_OP } from "app/constants"
import { devToolActions, useDispatch, useSelector } from "app/store"
import { useAxios } from "app/hooks"
import { FormControlLabel, Checkbox } from "@material-ui/core"

function useMockedApi() {
  const { getSe, getSede } = useAxios()
  const seMockRef = useRef<MockAdapter>()
  const sedeMockRef = useRef<MockAdapter>()

  if (__DEV__) {
    const { applyApiMock } = require("../test/api")
    return (mock: boolean) => {
      if (mock) {
        const opt = { apiResponseDelay: 420 }
        seMockRef.current = applyApiMock(getSe(), opt, "se")
        sedeMockRef.current = applyApiMock(getSede(), opt, "sede")
      } else {
        seMockRef.current?.restore()
        sedeMockRef.current?.restore()
      }
    }
  }
  return NO_OP
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
    <div style={{ position: "fixed", bottom: 10, left: 10 }}>
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
