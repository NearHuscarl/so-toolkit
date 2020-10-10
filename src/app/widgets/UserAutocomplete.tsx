import React from "react"
import throttle from "lodash/throttle"
import { Avatar, CircularProgress, TextField } from "@material-ui/core"
import { Autocomplete } from "@material-ui/lab"
import parse from "autosuggest-highlight/parse"
import match from "autosuggest-highlight/match"
import Grid from "@material-ui/core/Grid"
import { UserService } from "app/services"
import { User } from "app/types"
import { __DEV__ } from "app/constants"
import { Badges } from "app/widgets/index"
import { makeStyles } from "app/styles"

const useStyles = makeStyles((theme) => ({
  avatar: {
    // refactoring ui: https://twitter.com/steveschoger/status/1064541476615593984
    boxShadow: "0 0 1.25px 0 rgba(0, 0, 0, 0.4)",
  },
  header: {
    display: "flex",
    alignItems: "baseline",
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

export default function UserAutocomplete(props: UserAutocompleteProps) {
  const classes = useStyles()
  const [value, setValue] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [options, setOptions] = React.useState<User[]>([])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetch = React.useCallback(
    throttle(
      (input: string, success: (users: User[]) => void) => {
        if (input.length <= 1) return

        setLoading(true)
        const params = { pagesize: 5 }

        return UserService.getUsersByName(input, params).then((result) =>
          success(result)
        )
      },
      DEBOUNCED_TIME,
      { leading: false }
    ),
    []
  )

  React.useEffect(() => {
    let active = true

    if (inputValue === "") {
      setOptions(value ? [value] : [])
      return undefined
    }

    fetch(inputValue, (results: User[]) => {
      if (active) {
        setLoading(false)
        let newOptions = [] as User[]

        if (value) {
          newOptions = [value]
        }

        if (results) {
          newOptions = [...newOptions, ...results]
        }

        setOptions(newOptions)
      }
    })

    return () => void (active = false)
  }, [value, inputValue, fetch])

  return (
    <Autocomplete
      id="user-autocomplete"
      classes={{ listbox: classes.listbox }}
      debug={__DEV__}
      getOptionLabel={(option) => {
        return typeof option === "string" ? option : option.display_name
      }}
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
      renderOption={(option) => {
        const matches = match(option.display_name, inputValue)
        const parts = parse(option.display_name, matches)

        return (
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Avatar
                variant="rounded"
                className={classes.avatar}
                src={option.profile_image}
              />
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
                <span className={classes.location}>
                  {trimLocation(option?.location)}
                </span>
              </div>
              <div className={classes.stats}>
                <div className={classes.reputation}>
                  {option.reputation.toLocaleString()}
                </div>
                <Badges badge={option.badge_counts} />
              </div>
            </Grid>
          </Grid>
        )
      }}
    />
  )
}
