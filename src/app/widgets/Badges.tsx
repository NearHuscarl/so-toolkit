import React from "react"
import { makeStyles } from "app/styles"
import { Grid } from "@material-ui/core"

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
  badge: {
    bronze: number
    silver: number
    gold: number
  }
}

export default function Badges(props: BadgesProps) {
  const classes = useStyles()
  const { badge } = props

  return (
    <Grid container className={classes.root}>
      <Grid item className={classes.bronze}>
        <span>●</span>
        <span>{badge.bronze}</span>
      </Grid>
      <Grid item className={classes.silver}>
        <span>●</span>
        <span>{badge.silver}</span>
      </Grid>
      <Grid item className={classes.gold}>
        <span>●</span>
        <span>{badge.gold}</span>
      </Grid>
    </Grid>
  )
}
