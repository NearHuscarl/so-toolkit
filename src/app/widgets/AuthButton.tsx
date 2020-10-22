import React from "react"
import { Button, MenuItem, Menu } from "@material-ui/core"
import { useAuth, useTry } from "app/hooks"
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
  const isLoading = useSelector((state) => state.auth.loading)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const { unauthorize } = useAuth()
  const $try = useTry()
  const onOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const onClose = () => {
    setAnchorEl(null)
  }
  const onLogout = () => {
    onClose()
    $try(unauthorize)
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
        <MenuItem disabled={isLoading} onClick={onLogout}>
          Logout
        </MenuItem>
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
  const { authorize } = useAuth()
  const isLogin = useSelector((state) => Boolean(state.auth.me))
  const isLoading = useSelector((state) => state.auth.loading)
  const $try = useTry()

  if (!isLogin) {
    return (
      <Button
        disabled={isLoading}
        color="secondary"
        onClick={() => $try(authorize)}
      >
        Login
      </Button>
    )
  }

  return <UserProfile />
}
