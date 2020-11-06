type ColumnType = "Text" | "Number" | "Default" | "Date"
type ColumnInfo<Name extends string, Type extends ColumnType = "Text"> = {
  name: Name
  type: Type
}

export declare namespace PplReached {
  type DetailBreakdown = {
    columns: [
      ColumnInfo<"date">,
      ColumnInfo<"id", "Number">,
      ColumnInfo<"title">,
      ColumnInfo<"impact", "Default">,
      ColumnInfo<"viewCount", "Number">,
      ColumnInfo<"score", "Number">,
      ColumnInfo<"question", "Default">,
      ColumnInfo<"score>0", "Default">,
      ColumnInfo<"accepted", "Default">,
      ColumnInfo<"score5+", "Default">,
      ColumnInfo<"20%Votes", "Default">,
      ColumnInfo<"top3", "Default">
    ]
    rows: [
      string, // date
      number, // id
      string, // title
      boolean, // impact
      number, // viewCount
      number, // score
      boolean, // question
      boolean, // positiveScore
      boolean | null, // accepted
      boolean | null, // score5+
      boolean | null, // 20%Votes
      boolean | null // top3
    ][]
  }

  type LastUpdate = {
    columns: [ColumnInfo<"lastUpdated">, ColumnInfo<"lastUpdatedDate", "Date">]
    rows: [
      string, // lastUpdated
      number // lastUpdatedDate
    ][]
  }

  type ViewsByPostType = {
    columns: [ColumnInfo<"postType">, ColumnInfo<"peopleReached", "Number">]
    rows: [["question", number], ["answer", number], ["all", number]]
  }

  type ViewsByTag = {
    columns: [
      ColumnInfo<"tag">,
      // TODO: change to peopleReached for consistency
      ColumnInfo<"viewCount", "Number">
    ]
    rows: [
      string, // tag
      number // views
    ][]
  }

  type ViewsByMonth = {
    columns: [ColumnInfo<"month">, ColumnInfo<"peopleReached", "Number">]
    rows: [
      string, // month
      number // views
    ][]
  }
}

export type PeopleReached = {
  resultSets: [
    PplReached.DetailBreakdown,
    PplReached.LastUpdate,
    PplReached.ViewsByPostType,
    PplReached.ViewsByTag,
    PplReached.ViewsByMonth
  ]
}
