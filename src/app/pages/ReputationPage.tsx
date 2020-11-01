import React from "react"
import { Profile, UserAutocomplete } from "app/widgets"
import { Box, Card, CardContent, Typography } from "@material-ui/core"
import { PeopleReached, User } from "app/types"
import { useSeApi } from "app/hooks"

function printObject(value: any) {
  if (typeof value === "string") {
    return value
  }
  return JSON.stringify(value, null, 4)
}

export function ReputationPage() {
  const [result, setResult] = React.useState<PeopleReached | string>(
    "No user found"
  )
  const { pplReachedService } = useSeApi()
  const onChangeUser = (user: User) => {
    pplReachedService.get(user.user_id).then((data) => {
      setResult(data)
    })
  }

  return (
    <Box p={4} display="flex" justifyContent="center">
      <Box width={400}>
        <UserAutocomplete onChange={onChangeUser} />
        <Card>
          <CardContent>
            <Typography variant="h5">User</Typography>
            <pre style={{ whiteSpace: "pre-wrap" }}>{printObject(result)}</pre>
          </CardContent>
          {/*<Profile />*/}
        </Card>
      </Box>
    </Box>
  )
}
