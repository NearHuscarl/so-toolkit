import React from "react"
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
} from "@material-ui/core"
import MenuIcon from "@material-ui/icons/Menu"
import { makeStyles } from "app/styles"
import { createStyles } from "@material-ui/styles"
import { AuthButton } from "app/widgets"
import { useLocation } from "react-router-dom"

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  })
)

export function AppBar() {
  const classes = useStyles()
  const location = useLocation()

  return (
    <MuiAppBar position="static">
      <Toolbar>
        {/*<IconButton*/}
        {/*  edge="start"*/}
        {/*  className={classes.menuButton}*/}
        {/*  color="inherit"*/}
        {/*  aria-label="menu"*/}
        {/*>*/}
        {/*  <MenuIcon />*/}
        {/*</IconButton>*/}
        <Typography variant="h6" className={classes.title}>
          SO Toolkit
        </Typography>
        {location.pathname !== "/login" && <AuthButton />}
      </Toolbar>
    </MuiAppBar>
  )
}
