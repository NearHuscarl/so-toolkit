import React from "react"
import { makeStyles } from "app/styles"
import { Grid } from "@material-ui/core"
import { Badge } from "app/types"

const badgeStyle = {
  display: "flex",
  columnGap: 1,
  "& > :first-child": {
    marginTop: -1,
  },
}

const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: 11.75,
    columnGap: 7,
  },
  bronze: {
    color: theme.app.badge.bronze,
    ...badgeStyle,
  },
  silver: {
    color: theme.app.badge.silver,
    ...badgeStyle,
  },
  gold: {
    color: theme.app.badge.gold,
    ...badgeStyle,
  },
}))

type BadgesProps = {
  badge: Badge
}

export function Badges(props: BadgesProps) {
  const classes = useStyles()
  const { badge } = props
  const displayBadge = (type: keyof Badge) => {
    if (badge[type] === 0) {
      return null
    }
    const title = `${type} badge`
    return (
      <Grid key={title} item className={classes[type]}>
        <span title={title}>●</span>
        <span>{badge[type]}</span>
      </Grid>
    )
  }

  return (
    <Grid container className={classes.root}>
      {displayBadge("gold")}
      {displayBadge("silver")}
      {displayBadge("bronze")}
    </Grid>
  )
}
