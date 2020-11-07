import React from "react"
import { AgGridReact } from "ag-grid-react"
import { ColDefs, PplReached } from "app/types"
import { DetailBreakdownTableStyles } from "./DetailBreakdownTable.styles"

function getColDefs(): ColDefs {
  return [
    { field: "date", headerName: "Date", width: 120 },
    { field: "title", headerName: "Title", width: 400 },
    { field: "impact", headerName: "Impact", width: 80 },
    { field: "viewCount", headerName: "Views", width: 100 },
    { field: "question", headerName: "Question", width: 100 },
    { field: "score>0", headerName: "Score > 0", width: 110 },
    { field: "accepted", headerName: "Accepted", width: 100 },
    { field: "score5+", headerName: "Score 5+", width: 100 },
    { field: "20%Votes", headerName: "20% Votes", width: 110 },
    { field: "top3", headerName: "Top 3", width: 80 },
  ]
}

function getRowData(rows: any[]) {
  return rows.map((row, id) => ({
    id: id,
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
      />
    </DetailBreakdownTableStyles>
  )
}
