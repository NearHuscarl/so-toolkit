import React from "react"
import throttle from "lodash/throttle"
import { AxiosError } from "axios"
import { CircularProgress, TextField, Tooltip, Grid } from "@material-ui/core"
import { Autocomplete } from "@material-ui/lab"
import parse from "autosuggest-highlight/parse"
import match from "autosuggest-highlight/match"
import { ApiResponse, User } from "app/types"
import { __DEV__ } from "app/constants"
import { Badges, UserAvatar } from "app/widgets"
import { makeStyles } from "app/styles"
import { useIsMounted, useSeApi, useSnackbar } from "app/hooks"
import { getApiError } from "app/helpers"

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
  highlight: {
    fontWeight: 600,
    color: theme.palette.primary.dark,
    backgroundColor: "rgba(63,81,181,.2)",
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

export const DEBOUNCED_TIME = 350

export function UserAutocomplete(props: UserAutocompleteProps) {
  const { userService } = useSeApi()
  const { createErrorSnackbar } = useSnackbar()
  const classes = useStyles()
  const [value, setValue] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [options, setOptions] = React.useState<User[]>([])
  const isMounted = useIsMounted()

  const fetch = React.useMemo(
    () =>
      throttle(
        (
          input: string,
          success: (users: User[]) => void,
          failure: (e: AxiosError<ApiResponse>) => void
        ) => {
          if (!isMounted() || input.length <= 1) return

          setLoading(true)

          return userService
            ?.getUsersByName(input, { pagesize: 5 })
            .then(success)
            .catch(failure)
        },
        DEBOUNCED_TIME,
        { leading: false }
      ),
    [isMounted, userService]
  )

  React.useEffect(() => {
    let isStale = false

    if (inputValue === "") {
      setOptions(value ? [value] : [])
      return undefined
    }

    // user selects the option which is already in the cache
    if (inputValue === value?.display_name) {
      return
    }

    fetch(
      inputValue,
      (results) => {
        if (isStale) {
          return
        }

        setLoading(false)
        let newOptions = [] as User[]

        if (value) {
          newOptions = [value]
        }

        if (results) {
          newOptions = [...newOptions, ...results]
        }

        setOptions(newOptions)
      },
      (e) => {
        setLoading(false)
        createErrorSnackbar(getApiError(e).message)
      }
    )

    return () => void (isStale = true)
  }, [value, inputValue, fetch, createErrorSnackbar])

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
      loading={loading}
      includeInputInList
      loadingText={getLoadingNode()}
      filterSelectedOptions
      value={value}
      fullWidth
      onChange={(event: any, newValue: User | null) => {
        setOptions(newValue ? [newValue, ...options] : options)
        setValue(newValue)
        if (newValue && props.onChange) {
          props?.onChange(newValue)
        }
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue)
      }}
      renderInput={(params) => (
        <TextField {...params} label="Search user..." type="search" />
      )}
      renderOption={(user) => {
        const matches = match(user.display_name, inputValue)
        const parts = parse(user.display_name, matches)

        return (
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <UserAvatar src={user.profile_image} />
            </Grid>
            <Grid item xs>
              <div className={classes.header}>
                <span className={classes.title}>
                  {parts.map((part, index) => (
                    <span
                      key={index}
                      className={part.highlight ? classes.highlight : ""}
                    >
                      {part.text}
                    </span>
                  ))}
                </span>
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
