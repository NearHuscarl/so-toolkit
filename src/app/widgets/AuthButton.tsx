import React from "react"
import { Button, MenuItem, Menu } from "@material-ui/core"
import { useAuth, useSnackbar } from "app/hooks"
import { useSelector } from "app/store"
import { UserAvatar } from "app/widgets/UserAvatar"
import { makeStyles } from "app/styles"

const useProfileStyles = makeStyles({
  root: {
    cursor: "pointer",
  },
})

function UserProfile() {
  const classes = useProfileStyles()
  const me = useSelector((state) => state.auth.me)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const { unauthorize } = useAuth()
  const onOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const onClose = () => {
    setAnchorEl(null)
  }
  const onLogout = () => {
    onClose()
    return unauthorize()
  }

  return (
    <>
      <UserAvatar
        src={me?.profile_image}
        className={classes.root}
        onClick={onOpen}
      />
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={onClose}
        transformOrigin={{
          vertical: -50,
          horizontal: "center",
        }}
      >
        {/*<MenuItem onClick={handleClose}>Profile</MenuItem>*/}
        <MenuItem onClick={onLogout}>Logout</MenuItem>
      </Menu>
    </>
  )
}

/*
 * AuthButton shows the login button when the user is logged out
 * and displays the user Avatar with logout option when the user
 * is logged in
 */
export function AuthButton() {
  const { createErrorSnackbar } = useSnackbar()
  const { authorize } = useAuth()
  const isLogin = useSelector((state) => Boolean(state.auth.me))

  if (!isLogin) {
    const onLogin = async () => {
      try {
        await authorize()
      } catch (e) {
        createErrorSnackbar(e.message)
      }
    }

    return (
      <Button color="secondary" onClick={onLogin}>
        Login
      </Button>
    )
  }

  return <UserProfile />
}
