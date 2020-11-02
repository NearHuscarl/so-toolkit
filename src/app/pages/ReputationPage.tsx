import React from "react"
import { Profile, UserAutocomplete } from "app/widgets"
import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Typography,
} from "@material-ui/core"
import { User } from "app/types"
import { useSeApi, useTry } from "app/hooks"

function printObject(value: any) {
  if (typeof value === "string") {
    return value
  }
  return JSON.stringify(value, null, 4)
}

export function ReputationPage() {
  const { pplReachedService } = useSeApi()
  const { $try, data, isPending } = useTry(pplReachedService.get)
  const onChangeUser = async (user: User) => {
    await $try(user.user_id)
  }

  return (
    <Box p={4} display="flex" justifyContent="center">
      <Box width={400}>
        <UserAutocomplete onChange={onChangeUser} />
        <Card>
          <CardContent>
            <Box display="flex" flexDirection="column" gridRowGap={10}>
              <Typography variant="h5">User</Typography>
              {isPending && <LinearProgress />}
            </Box>
            <pre style={{ whiteSpace: "pre-wrap" }}>{printObject(data)}</pre>
          </CardContent>
          {/*<Profile />*/}
        </Card>
      </Box>
    </Box>
  )
}
