type ColumnType = "Text" | "Number" | 'Default'| 'Date'
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
      date: string,
      id: number,
      title: string,
      impact: boolean,
      viewCount: number,
      score: number,
      question: boolean,
      postiveScore: boolean,
      accepted: boolean | null,
      score5: boolean | null,
      // goddamn typescript can't even display number
      oneFifthVotes: boolean | null,
      top3: boolean | null
    ][]
  }

  type LastUpdate = {
    columns: [
      ColumnInfo<"lastUpdated">,
      ColumnInfo<"lastUpdatedDate", "Date">,
    ]
    rows: [
      lastUpdated: string,
      lastUpdatedDate: number,
    ][]
  }

  type ViewsByPostType = {
    columns: [
      ColumnInfo<"postType">,
      ColumnInfo<"peopleReached", "Number">,
    ]
    rows: [['question', number],['answer', number],['all', number]]
  }

  type ViewsByTag = {
    columns: [
      ColumnInfo<"tag">,
      // TODO: change to peopleReached for consistency
      ColumnInfo<"viewCount", "Number">,
    ]
    rows: [
      tag: string,
      views: number
    ][]
  }

  type ViewsByMonth = {
    columns: [
      ColumnInfo<"month">,
      ColumnInfo<"peopleReached", "Number">,
    ]
    rows: [
      month: string,
      views: number
    ][]
  }
}

export type PeopleReached = {
  resultSets: [
    PplReached.DetailBreakdown,
    PplReached.LastUpdate,
    PplReached.ViewsByPostType,
    PplReached.ViewsByTag,
    PplReached.ViewsByMonth,
  ]
}
