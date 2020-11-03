import React from "react"
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
} from "@material-ui/core"
import MenuIcon from "@material-ui/icons/Menu"
import { createStyles } from "@material-ui/styles"
import { useLocation } from "react-router-dom"
import { makeStyles } from "app/styles"
import { AuthButton } from "app/widgets"
import { AppDrawer } from "app/widgets/AppDrawer"
import { useSelector } from "app/store"

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(1),
    },
    title: {
      flexGrow: 1,
    },
  })
)

export function AppBar() {
  const classes = useStyles()
  const { pathname } = useLocation()
  const isAuthRoute = pathname === "/login"
  const isLogin = useSelector((state) => Boolean(state.auth.accessToken))
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  return (
    <>
      <MuiAppBar position="static">
        <Toolbar>
          {isLogin && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" className={classes.title}>
            SO Toolkit
          </Typography>
          {!isAuthRoute && <AuthButton />}
        </Toolbar>
      </MuiAppBar>
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
