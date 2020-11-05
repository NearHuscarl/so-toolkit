-- QueryID=1321873
-- Title=People Reached (Final)
-- Description=People Reached is an estimate of how many times your Questions or Answers have been useful to somebody

/*
Reference:
- https://meta.stackexchange.com/questions/244534
Forked from:
- https://data.stackexchange.com/stackoverflow/query/863199

People Reached is an estimate of how many times your Questions or
Answers have been useful to somebody. It's calculated based on
the following criteria:

Questions and Answers
- Non-deleted
Answers
- Not a self-answer (views are already calculated in the question)
- Score > 0 (upvotes + downvotes > 0)
- 1 of 4 criteria below
  - (#1) Accepted
  - (#2) Score >= 5
  - (#3) Tops 3 highest score answers
  - (#4) Has 20% of the total answer vote count

If the condition is met, you get all views of the question,
otherwise, you get none.
*/

set nocount on

declare @userId int = ##userID?1##

declare @questionType tinyint = 1
declare @answerType tinyint = 2
-- it's 2020 and I can't even have a boolean literal
declare @true bit = convert(bit, 1)
declare @false bit = convert(bit, 0)

declare @dt1 varchar(25) = convert(varchar, getdate(), 21)

-- list eligible answers
select id, parentId, creationDate, score, postTypeId, ownerUserId
into #eligibleAnswers from posts a
where
  ownerUserId = @userId
  and postTypeId = @answerType
  and score > 0
  -- no self-answer
  and (
    select count(id) from posts q
    where a.parentId = q.id
      and q.ownerUserId = @userId
  ) = 0
  -- and deletionDate is null
  -- Note: Deleted posts are stored in PostsWithDeleted table and
  -- ALREADY EXCLUDED from this table

declare @dt2 varchar(25) = convert(varchar, getdate(), 21)

------ Populate #1 and #2 ------
select
  a.creationDate,
  a.id as aID, --answer ID
  a.parentId,  --question ID
  a.score,
  a.postTypeId,
  a.ownerUserId,
  q.title,
  q.viewCount,
  -- rank for multiple answers by the same users in a question
  -- used to filter out all answers but the highest score one to
  -- remove duplicated views when computing
  rank() over (partition by a.parentId order by a.score desc)
    as [ownAnswerRank],
  iif (a.id = q.acceptedAnswerId, 1, 0) as [1of4:IsAccepted],
  iif (a.score >= 5, 1, 0) as [2of4:ScoreMin5],
  a.score as [Votes:me],
  --total vote count of all answers of this question
  (
    select sum(aa.Score) as [Votes:all]
    from posts aa
    where aa.parentId = q.id
  ) as [Votes:all]
into #answers2
from #eligibleAnswers a
  left join posts q on a.parentId = q.id
where q.postTypeId = @questionType

declare @dt3 varchar(25) = convert(varchar,getdate(),21)

------ Populate #3 ------
select *,
  iif (
    (cast([Votes:me] as decimal) /
    -- fix divide to 0 bug
    iif ([Votes:all] <= 0, 1, [Votes:all])
    ) >= 0.2,
  1, 0) as [3of4:20pVotes]
into #answers3
from #answers2
      -- get the highest score answer if there are many in one
      -- question
where ownAnswerRank = 1

declare @dt4 varchar(25) = convert(varchar,getdate(),21)

-- Create a list of all answers per question
-- to determine if your answer is in Top 3
select
   pAll.parentId as [qID],
   pAll.id as [aID],
   pAll.ownerUserId,
   rank() over (
     partition by pAll.parentId
     order by pAll.score desc
   ) as [Rank]
into #voteRanks
from #answers3 pMine left join posts pAll
on pMine.parentId = pAll.parentId
where pMine.ownerUserId = @userId
  and pall.parentid is not null
  and pMine.postTypeId = @answerType

declare @dt5 varchar(25) = convert(varchar,getdate(),21)

------ Populate #4 ------
select a3.*,
  -- rank among answers for question
  vr.rank,
  -- in the top 3 answers for question ?
  iif (vr.rank <= 3, 1, 0) as [4of4:IsInTop3]
into #answers4
from
  #answers3 a3 left join #voteRanks vr
  on a3.[aID] = vr.[aID]
order by
  a3.[aID], vr.[aID]

declare @dt6 varchar(25) = convert(varchar,getdate(),21)

select
  *,
  iif (
    [1of4:IsAccepted]+
    [2of4:ScoreMin5]+
    [3of4:20pVotes]+
    [4of4:IsInTop3] > 0, @true, @false) as [impact],
  iif (
    [1of4:IsAccepted]+
    [2of4:ScoreMin5]+
    [3of4:20pVotes]+
    [4of4:IsInTop3] = 0, @true, @false) as [No1234]
into #answers5
from #answers4  -----------------------------> (now has 1,2,3,4)

declare @dt7 varchar(25) = convert(varchar,getdate(),21)

------ Populate Questions ------
select
  [creationDate],
  id,
  [title],
  [score],
  [postTypeId],
  [viewCount],
  @true as impact, -- all non-deleted questions are eligible
  0 as [1of4:IsAccepted],
  0 as [2of4:ScoreMin5],
  0 as [3of4:20pVotes],
  0 as [4of4:IsInTop3],
  0 as [Votes:all],
  0 as [Votes:me],
  0 as [Rank],
  @false as [No1234]
into #eligibleQuestions
from posts
where
  -- deletionDate is null and already excluded from source table
  postTypeId = @questionType
  and ownerUserId = @userId


declare @dt8 varchar(25) = convert(varchar,getdate(),21)

--- Table #1: Detail breakdown ----

  select ------> FINALIZE ANSWER LIST
    format(creationDate,'yyyy-MM-dd') as [date],
    aID as [id],
    [title],
    [impact],
    viewCount,
    score,
    iif (postTypeId = @questionType, @true, @false) as [question],
    iif (postTypeId = @questionType, @false, @true) as [score>0],
    iif ([No1234]=1, @false,
      iif ([1of4:IsAccepted]=1, @true, null)) as [accepted],
    iif ([No1234]=1, @false,
      iif ([2of4:ScoreMin5]=1, @true, null)) as [score5+],
    iif ([No1234]=1, @false,
      iif ([3of4:20pVotes]=1, @true, null)) as [20%Votes],
    iif ([No1234]=1, @false,
      iif ([4of4:IsInTop3]=1, @true, null)) as [top3]
  from #answers5
UNION all
  select ------> FINALIZE QUESTION LIST
    format(creationDate,'yyyy-MM-dd') as [date],
    [id],
    [title],
    [impact],
    viewCount,
    score,
    iif (postTypeId = @questionType, @true, @false) as [question],
    iif (postTypeId = @questionType, @false, @true) as [score>0],
    iif ([No1234]=1, @false,
      iif ([1of4:IsAccepted]=1, @true, null)) as [accepted],
    iif ([No1234]=1, @false,
      iif ([2of4:ScoreMin5]=1, @true, null)) as [score5+],
    iif ([No1234]=1, @false,
      iif ([3of4:20pVotes]=1, @true, null)) as [20%Votes],
    iif ([No1234]=1, @false,
      iif ([4of4:IsInTop3]=1, @true, null)) as [top3]
  from #eligibleQuestions
UNION all
  select ------> (list EXCLUDED answers - these all failed)
    format(a.creationDate,'yyyy-MM-dd') as [date],
    a.id,
    q.title,
    @false as impact,
    q.viewCount,
    a.score,
    @false as question,
    @false as [score>0],
    null as [accepted],
    null as [score5+],
    null as [20%Votes],
    null as [top3]
  from posts a join posts q on q.id = a.parentId
  where
    a.ownerUserId = @userId
    and a.postTypeId = @answerType
    and a.score <= 0

order by viewCount desc

declare @dt9 varchar(25) = convert(varchar,getdate(),21)

--- Table #2: last update date ---
declare @dtUpdated datetime = (
  select min(create_date) from sys.tables)

select
  format(datediff(hh,@dtUpdated,getdate())/24.0,'0.0')+' days ago'
    as [lastUpdated],
  @dtUpdated
    as [lastUpdatedDate]

declare @dt10 varchar(25) = convert(varchar,getdate(),21)

--- Table #3: Total views by post type ---
select
  'question' as [postType],
  sum(iif (impact = 1, viewCount, 0)) as [peopleReached]
into #summary
from #eligibleQuestions

insert into #summary
select
  'answer' as [postType],
  sum(iif (impact = 1, viewCount, 0)) as [peopleReached]
from #answers5

insert into #summary
select
  'all' as [postType],
  (select sum(peopleReached) from #summary) as [peopleReached]

select * from #summary

declare @dt11 varchar(25) = convert(varchar,getdate(),21)

--- Table #4: Total views by tag ---

select tagName as tag, sum(viewCount) as viewCount
from (
  -- all eligible answers
  select t.tagName, q.viewCount
  from #answers5 a
  left join posts q
    on a.parentId = q.id
  left join postTags pt
    on q.id = pt.postId
  left join tags t
    on pt.tagId = t.id
union all
  -- all eligible questions
  select t.tagName, q.viewCount
  from #eligibleQuestions q
  left join postTags pt
    on q.id = pt.postId
  left join tags t
    on pt.tagId = t.id
) t
group by tagName
order by viewCount desc

declare @dt12 varchar(25) = convert(varchar,getdate(),21)

--- Table #5: Total by Month ---
select format(creationDate,'yyyy-MM') as [month],
  sum(iif (impact = 1, viewCount, 0)) as [peopleReached]
from (
  select creationDate, impact, viewCount
  from #answers5
union all
  select creationDate, impact, viewCount
  from #eligibleQuestions
) t
group by format(creationDate,'yyyy-MM')
order by format(creationDate,'yyyy-MM')

declare @dtEnd varchar(25) = convert(varchar,getdate(),21)

print @dt1
print '1-2: '   + format(datediff(ms,@dt1,@dt2),'0ms')
print '2-3: '   + format(datediff(ms,@dt2,@dt3),'0ms')
print '3-4: '   + format(datediff(ms,@dt3,@dt4),'0ms')
print '4-5: '   + format(datediff(ms,@dt4,@dt5),'0ms')
print '5-6: '   + format(datediff(ms,@dt5,@dt6),'0ms')
print '6-7: '   + format(datediff(ms,@dt6,@dt7),'0ms')
print '7-8: '   + format(datediff(ms,@dt7,@dt8),'0ms')
print '8-9: '   + format(datediff(ms,@dt8,@dt9),'0ms')
print '9-10: '  + format(datediff(ms,@dt9,@dt10),'0ms')
print '10-11: ' + format(datediff(ms,@dt10,@dt11),'0ms')
print '11-12: ' + format(datediff(ms,@dt11,@dt12),'0ms')
print '12-E: '  + format(datediff(ms,@dt12,@dtEnd),'0ms')
print 'ALL: '   + format(datediff(ms,@dt1,@dtEnd),'0ms')
print @dtEnd
