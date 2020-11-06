import React from "react"
import { Columns, DataGrid, RowData, RowsProp } from "@material-ui/data-grid"
import { PplReached } from "app/types"

type Props = {
  data?: PplReached.DetailBreakdown
}

function getColDefs() {
  return [
    { field: "date", headerName: "Date", width: 120 },
    { field: "title", headerName: "Title", width: 400 },
    { field: "impact", headerName: "Impact", width: 80 },
    { field: "viewCount", headerName: "Views", width: 100 },
    { field: "question", headerName: "Is Question", width: 110 },
    { field: "score>0", headerName: "Score > 0", width: 110 },
    { field: "accepted", headerName: "Accepted", width: 100 },
    { field: "score5+", headerName: "Score 5+", width: 100 },
    { field: "20%Votes", headerName: "20% Votes", width: 110 },
    { field: "top3", headerName: "Top 3", width: 80 },
  ]
}

export function DetailBreakdownTable(props: Props) {
  const { data } = props
  console.log(data)

  const [columns, rows] = React.useMemo((): [Columns, RowsProp] => {
    if (!data) return [getColDefs(), []]
    const { rows } = data

    return [
      getColDefs(),
      rows.map((r, id) => {
        return {
          id: id,
          date: r[0],
          title: r[2],
          impact: r[3],
          viewCount: r[4],
          question: r[6],
          "score>0": r[7],
          accepted: r[8],
          "score5+": r[9],
          "20%Votes": r[10],
          top3: r[11],
        } as RowData
      }),
    ]
  }, [data])

  return (
    <div style={{ height: "90vh", width: "100%" }}>
      <DataGrid rows={rows} columns={columns} />
    </div>
  )
}
