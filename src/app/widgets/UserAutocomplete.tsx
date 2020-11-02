import React from "react"
import throttle from "lodash/throttle"
import { CircularProgress, TextField, Tooltip, Grid } from "@material-ui/core"
import { Autocomplete } from "@material-ui/lab"
import { User } from "app/types"
import { __DEV__ } from "app/constants"
import { Badges, Highlighter, UserAvatar } from "app/widgets"
import { makeStyles } from "app/styles"
import { useIsMounted, useSeApi, useTry } from "app/hooks"

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "baseline",
    columnGap: 2,
    marginBottom: 3,
  },
  title: {
    fontWeight: "bolder",
    marginRight: 3,
  },
  modFlair: {
    color: "#3ca4ff",
  },
  location: {
    fontSize: 11,
    color: "grey",
    fontWeight: "lighter",
    marginLeft: "auto",
  },
  stats: {
    display: "flex",
    columnGap: 8,
    marginBottom: 3,
  },
  reputation: {
    fontSize: 11.75,
    fontWeight: 550,
  },

  listbox: {
    maxHeight: "70vh",
  },
}))

function trimLocation(location?: string) {
  if (!location || location.length <= 12) return location

  const parts = location.split(",")
  return parts[parts.length - 1]
}

function getLoadingNode() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <CircularProgress size={20} style={{ marginRight: 10 }} />
      Loading users...
    </div>
  )
}

type UserAutocompleteProps = {
  onChange?: (u: User) => void
}

export const DEBOUNCED_TIME = 550

export function UserAutocomplete(props: UserAutocompleteProps) {
  const { userService } = useSeApi()
  const classes = useStyles()
  const [value, setValue] = React.useState<User | null>(null)
  const [inputValue, setInputValue] = React.useState("")
  const [options, setOptions] = React.useState<User[]>([])
  const isMounted = useIsMounted()
  const getUsers = React.useCallback(
    (input: string) => userService.getUsersByName(input, { pagesize: 5 }),
    [userService]
  )
  const { $try: tryGetUsers, isPending, data } = useTry(getUsers)

  const fetch = React.useMemo(
    () =>
      throttle(
        (input: string) => {
          if (!isMounted() || input.length <= 1) return

          return tryGetUsers(input)
        },
        DEBOUNCED_TIME,
        { leading: false }
      ),
    [isMounted, tryGetUsers]
  )

  React.useEffect(() => {
    if (inputValue === "") {
      setOptions(value ? [value] : [])
      return
    }

    // user selects the option which is already in the cache
    if (inputValue === value?.display_name) {
      return
    }

    fetch(inputValue)
  }, [fetch, inputValue, value])

  React.useEffect(() => {
    let newOptions = [] as User[]

    if (value) {
      newOptions = [value]
    }

    if (data) {
      newOptions = [...newOptions, ...data]
    }

    setOptions(newOptions)
  }, [data, value])

  return (
    <Autocomplete
      id="user-autocomplete"
      classes={{ listbox: classes.listbox }}
      debug={__DEV__}
      getOptionLabel={(option) => {
        return typeof option === "string" ? option : option.display_name
      }}
      noOptionsText="No user"
      filterOptions={(x) => x}
      options={options}
      autoComplete
      clearOnBlur={false}
      loading={isPending}
      includeInputInList
      loadingText={getLoadingNode()}
      filterSelectedOptions
      value={value}
      fullWidth
      onChange={(event: any, newValue: User | null) => {
        setValue(newValue)
        if (newValue) {
          props.onChange?.(newValue)
        }
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue)
      }}
      renderInput={(params) => (
        <TextField {...params} label="Search user..." type="search" />
      )}
      renderOption={(user) => {
        return (
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <UserAvatar src={user.profile_image} />
            </Grid>
            <Grid item xs>
              <div className={classes.header}>
                <Highlighter
                  className={classes.title}
                  textToHighlight={user.display_name}
                  searchWord={inputValue}
                />
                {user.user_type === "moderator" && (
                  <Tooltip title="This user is a moderator">
                    <span className={classes.modFlair}>♦</span>
                  </Tooltip>
                )}
                <span className={classes.location}>
                  {trimLocation(user?.location)}
                </span>
              </div>
              <div className={classes.stats}>
                <div title="reputation" className={classes.reputation}>
                  {user.reputation.toLocaleString()}
                </div>
                <Badges badge={user.badge_counts} />
              </div>
            </Grid>
          </Grid>
        )
      }}
    />
  )
}
