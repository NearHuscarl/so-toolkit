import React from "react"
import { Profile, UserAutocomplete } from "app/widgets"
import { Box, Card, CardContent, Typography } from "@material-ui/core"
import { User } from "app/types"

function printObject(value: any) {
  if (typeof value === "string") {
    return value
  }
  return JSON.stringify(value, null, 4)
}

export default function ReputationPage() {
  const [user, setUser] = React.useState<User | string>("No user found")
  return (
    <Box p={4} display="flex" justifyContent="center">
      <Box width={400}>
        <UserAutocomplete onChange={setUser} />
        <Card>
          <CardContent>
            <Typography variant="h5">User</Typography>
            <pre style={{ whiteSpace: "pre-wrap" }}>{printObject(user)}</pre>
          </CardContent>
          {/*<Profile />*/}
        </Card>
      </Box>
    </Box>
  )
}
