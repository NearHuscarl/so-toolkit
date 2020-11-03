import React from "react"
import {
  ListItemText,
  Divider,
  Drawer,
  List,
  ListItemIcon,
  ListItem,
  IconButton,
} from "@material-ui/core"
import HomeIcon from "@material-ui/icons/Home"
import HistoryIcon from "@material-ui/icons/History"
import PeopleIcon from "@material-ui/icons/People"
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft"
import { useHistory, useLocation } from "react-router-dom"
import { makeStyles } from "app/styles"
import clsx from "clsx"

const drawerWidth = 240
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  activeDrawerItem: {
    // TODO: add lighten/darken helper method
    backgroundColor: "#d8dcf0",
  },
  activeText: {
    fontWeight: "bold",
    color: theme.palette.primary.dark,
  },
}))

type DrawerItem = {
  title: string
  icon: React.ReactNode
  link: string
}

const drawerItems: DrawerItem[] = [
  {
    title: "Home",
    icon: <HomeIcon />,
    link: "/",
  },
  {
    title: "People Reached",
    icon: <PeopleIcon />,
    link: "/people-reached",
  },
  {
    title: "Post History",
    icon: <HistoryIcon />,
    link: "/post-history",
  },
]

type AppDrawerProps = {
  open?: boolean
  onClose?: () => void
}

export function AppDrawer(props: AppDrawerProps) {
  const { open, onClose } = props
  const classes = useStyles()
  const history = useHistory()
  const { pathname } = useLocation()
  const activeItemCls = (link: string) =>
    clsx({
      [classes.activeDrawerItem]: link === pathname,
    })
  const activeTextCls = (link: string) => {
    return clsx({
      [classes.activeText]: link === pathname,
    })
  }
  const onClickItem = (link: string) => () => {
    history.push(link)
    onClose?.()
  }

  const drawer = (
    <div>
      <div className={classes.toolbar}>
        <IconButton onClick={onClose}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <Divider />
      <List>
        {drawerItems.map(({ title, icon, link }) => (
          <ListItem
            button
            key={link}
            role="button"
            className={activeItemCls(link)}
            onClick={onClickItem(link)}
          >
            <ListItemIcon className={activeTextCls(link)}>{icon}</ListItemIcon>
            <ListItemText
              // TODO: investigate why adding Typography make .toHaveStyle() assertion failed
              disableTypography
              primary={title}
              className={activeTextCls(link)}
              classes={{ primary: activeTextCls(link) }}
            />
          </ListItem>
        ))}
      </List>
    </div>
  )

  // TODO: add mini variant when I have some kick-ass icons
  // https://material-ui.com/components/drawers/#mini-variant-drawer
  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      classes={{
        paper: classes.drawerPaper,
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {drawer}
    </Drawer>
  )
}
