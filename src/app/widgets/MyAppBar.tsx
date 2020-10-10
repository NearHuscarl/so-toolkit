import React from "react"
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
} from "@material-ui/core"
import MenuIcon from "@material-ui/icons/Menu"
import { makeStyles } from "app/styles"
import { createStyles } from "@material-ui/styles"

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

export default function MyAppBar(props) {
  const classes = useStyles()
  const onLogin = () => {}

  return (
    <AppBar position="static">
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
        {/*<Button color="inherit" onClick={onLogin}>*/}
        {/*  Login*/}
        {/*</Button>*/}
      </Toolbar>
    </AppBar>
  )
}
