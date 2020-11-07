import React, { CSSProperties, PropsWithChildren } from "react"
import { makeStyles, important } from "app/styles"
import { Theme, useTheme } from "@material-ui/core"

function cssVariables(theme: Theme) {
  return {
    "--ag-range-selection-border-color": theme.palette.primary.main,
    "--ag-header-background-color": "#ecf0f3",
    "--ag-row-border-color": theme.palette.divider,
    "--ag-border-color": "transparent",
    "--ag-odd-row-background-color": "#fcfdfe",
  } as CSSProperties
}

const useStyles = makeStyles({
  root: {
    "& .ag-center-cols-container, & .ag-header-row-floating-filter": {
      // we don't want to see blank space if there is few columns, fill the rest of the table with the same background color
      width: important("1000%"),
    },
    "& .ag-root-wrapper": {
      border: important("solid 1px var(--ag-row-border-color)"),
    },
    "& .ag-center-cols-viewport": {
      // fix double horizontal scrollbars on chrome
      overflow: "hidden",
    },
  },
})

export function DetailBreakdownTableStyles(props: PropsWithChildren<{}>) {
  const classes = useStyles()
  const theme = useTheme()

  return (
    <div className={classes.root}>
      <div className="ag-theme-alpine" style={cssVariables(theme)}>
        <div style={{ height: "90vh", width: "100%" }}>{props.children}</div>
      </div>
    </div>
  )
}
