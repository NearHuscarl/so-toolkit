import React from "react"
import Button from "@material-ui/core/Button"
import memoize from "lodash/memoize"
import { SetupWorkerApi } from "msw/lib/types/setupWorker/setupWorker"
import { __DEV__ } from "app/constants"
import { devToolActions, useDispatch, useSelector } from "app/store"

const getWorker = memoize(() => {
  if (__DEV__) {
    const { browser } = require("../test/browser")
    return browser as SetupWorkerApi
  }
  return undefined
})

export function DevTool() {
  const enableMru = useSelector((state) => state.devTool.enableMsw)
  const dispatch = useDispatch()

  React.useEffect(() => {
    if (__DEV__ && enableMru) {
      getWorker()?.start()
    }
  }, [])

  if (!__DEV__) return null

  const toggleEnableMru = () => {
    const enable = !enableMru
    const worker = getWorker()

    if (enable) {
      worker?.start()
    } else {
      worker?.stop()
    }

    dispatch(devToolActions.enableMsw(enable))
  }
  const action = enableMru ? "Disable" : "Enable"

  return (
    <div style={{ position: "absolute", bottom: 10, left: 10 }}>
      <Button color="secondary" variant="contained" onClick={toggleEnableMru}>
        {action} MSW
      </Button>
    </div>
  )
}
