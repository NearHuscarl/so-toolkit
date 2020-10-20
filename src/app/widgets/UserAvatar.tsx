import React from "react"
import { Avatar, AvatarProps } from "@material-ui/core"
import { makeStyles } from "app/styles"
import clsx from "clsx"

const useStyles = makeStyles((theme) => ({
  avatar: {
    // refactoring ui: https://twitter.com/steveschoger/status/1064541476615593984
    boxShadow: "0 0 1.25px 0 rgba(0, 0, 0, 0.4)",
  },
}))

export function UserAvatar(props: AvatarProps) {
  const classes = useStyles()

  return (
    <Avatar
      {...props}
      variant="rounded"
      className={clsx(classes.avatar, props.className)}
    />
  )
}
