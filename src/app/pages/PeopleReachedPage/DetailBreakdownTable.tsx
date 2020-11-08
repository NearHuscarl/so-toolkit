import React from "react"
import { AgGridReact } from "ag-grid-react"
import { ColDefs, PplReached } from "app/types"
import { DetailBreakdownTableStyles } from "./DetailBreakdownTable.styles"
import { ColDef, ICellRendererParams } from "ag-grid-community"
import { Link } from "@material-ui/core"
import { makeStyles } from "app/styles"
import red from "@material-ui/core/colors/red"
import green from "@material-ui/core/colors/green"
import teal from "@material-ui/core/colors/teal"
import clsx from "clsx"

const intl = new Intl.NumberFormat()

function getPostLink(postId: number, isQuestion: boolean) {
  const postType = isQuestion ? "q" : "a"
  return `https://stackoverflow.com/${postType}/${postId}/9449426`
}

function getDisplayedTitle(title: string, isQuestion: boolean) {
  const prefix = isQuestion ? "Q:" : "A:"
  return prefix + title
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "baseline",
    fontWeight: 600,
  },
  postType: {
    flexShrink: 0, // exact width
    width: 24,
    height: 24,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginRight: theme.spacing(1),
  },
  question: {
    backgroundColor: red["100"],
    color: red["800"],
  },
  answer: {
    backgroundColor: teal["100"],
    color: teal["800"],
  },
}))

function PostLinkCellRenderer(params: ICellRendererParams) {
  const { id, question } = params.data
  const prefix = question ? "Q:" : "A:"
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <span
        className={clsx(classes.postType, {
          [classes.question]: question,
          [classes.answer]: !question,
        })}
      >
        {prefix}
      </span>
      <Link
        href={getPostLink(id, question)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>{params.value}</span>
      </Link>
    </div>
  )
}

function NumberCellRenderer(params: ICellRendererParams) {
  return <>{intl.format(params.value)}</>
}

function BooleanCellRenderer(params: ICellRendererParams) {
  let val: string | null = null
  let color = ""
  let backgroundColor = ""

  if (params.value === true) {
    color = green[800]
    backgroundColor = green[100]
    val = "✔"
  } else if (params.value === false) {
    val = "✖"
    color = red[800]
    backgroundColor = red[100]
  }

  return (
    <div
      style={{
        paddingLeft: 8.5,
        backgroundColor,
        color,
      }}
    >
      {val}
    </div>
  )
}

type ColType = "boolean"
function getColumnTypes(): Record<ColType, ColDef> {
  return {
    boolean: {
      // remove padding so the cell-renderer width is the same with container width
      cellClass: "p0",
      cellRenderer: "BooleanCellRenderer",
    },
  }
}

function getColDefs(): ColDefs {
  return [
    { field: "date", headerName: "Date", width: 120 },
    {
      field: "title",
      headerName: "Post",
      width: 400,
      cellRenderer: "PostLinkCellRenderer",
      comparator: (a, b, nA, nB) =>
        getDisplayedTitle(a, nA.data.question) >
        getDisplayedTitle(b, nB.data.question)
          ? 1
          : -1,
    },
    {
      field: "viewCount",
      headerName: "Views",
      width: 100,
      type: "numericColumn",
      cellRenderer: "NumberCellRenderer",
    },
    {
      field: "impact",
      headerName: "Impact",
      width: 80,
      type: "boolean",
    },
    {
      field: "score>0",
      headerName: "Score > 0",
      width: 110,
      type: "boolean",
    },
    {
      field: "accepted",
      headerName: "Accepted",
      width: 100,
      type: "boolean",
    },
    {
      field: "score5+",
      headerName: "Score 5+",
      width: 100,
      type: "boolean",
    },
    {
      field: "20%Votes",
      headerName: "20% Votes",
      width: 110,
      type: "boolean",
    },
    {
      field: "top3",
      headerName: "Top 3",
      width: 80,
      type: "boolean",
    },
  ]
}

function getRowData(rows: any[]) {
  return rows.map((row) => ({
    id: row[1],
    date: row[0],
    title: row[2],
    impact: row[3],
    viewCount: row[4],
    question: row[6],
    "score>0": row[7],
    accepted: row[8],
    "score5+": row[9],
    "20%Votes": row[10],
    top3: row[11],
  }))
}

type Props = {
  data?: PplReached.DetailBreakdown
}

export function DetailBreakdownTable(props: Props) {
  const { data } = props
  const [columns, rows] = React.useMemo((): [ColDefs, any[]] => {
    if (!data) return [getColDefs(), []]
    return [getColDefs(), getRowData(data.rows)]
  }, [data])

  return (
    <DetailBreakdownTableStyles>
      <AgGridReact
        rowData={rows}
        columnDefs={columns}
        defaultColDef={{
          sortable: true,
        }}
        columnTypes={getColumnTypes()}
        frameworkComponents={{
          PostLinkCellRenderer,
          NumberCellRenderer,
          BooleanCellRenderer,
        }}
      />
    </DetailBreakdownTableStyles>
  )
}
