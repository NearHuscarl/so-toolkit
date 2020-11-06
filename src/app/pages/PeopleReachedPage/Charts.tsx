import React from "react"
import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Typography,
} from "@material-ui/core"
import { Profile } from "app/widgets"
import { PeopleReached, PplReached } from "app/types"

function printObject(value?: PplReached.LastUpdate) {
  return JSON.stringify(value || "No result", null, 4)
}

type Props = {
  loading: boolean
  lastUpdate?: PplReached.LastUpdate
  viewsByMonth?: PplReached.ViewsByMonth
  viewsByPostType?: PplReached.ViewsByPostType
  viewsByTag?: PplReached.ViewsByTag
}

export function Charts(props: Props) {
  const {
    loading,
    lastUpdate,
    viewsByMonth,
    viewsByPostType,
    viewsByTag,
  } = props

  return (
    <Card>
      <CardContent>
        <Box display="flex" flexDirection="column" gridRowGap={10}>
          <Typography variant="h5">User</Typography>
          {loading && <LinearProgress />}
        </Box>
        <pre style={{ whiteSpace: "pre-wrap" }}>{printObject(lastUpdate)}</pre>
      </CardContent>
      {/*<Profile />*/}
    </Card>
  )
}
