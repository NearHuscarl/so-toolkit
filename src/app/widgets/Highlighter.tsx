import React from "react"
import clsx from "clsx"
import parse from "autosuggest-highlight/parse"
import match from "autosuggest-highlight/match"
import { makeStyles } from "app/styles"

const useStyles = makeStyles((theme) => ({
  highlight: {
    fontWeight: 600,
    color: theme.palette.primary.dark,
    backgroundColor: "rgba(63,81,181,.2)",
  },
}))

type HighlighterProps = {
  className?: string
  textToHighlight: string
  searchWord: string
}

export function Highlighter(props: HighlighterProps) {
  const { className, textToHighlight, searchWord } = props
  const classes = useStyles()
  const matches = match(textToHighlight, searchWord)
  const parts = parse(textToHighlight, matches)

  return (
    <span className={className}>
      {parts.map((part, index) => (
        <span
          key={index}
          className={clsx({ [classes.highlight]: part.highlight })}
        >
          {part.text}
        </span>
      ))}
    </span>
  )
}
