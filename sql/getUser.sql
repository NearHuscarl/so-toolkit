-- QueryID=1306035
-- Title=Get user by user ID
-- Description=A minimal example to get started

-- Note: SEDE doesn't have a save API endpoint to update the SQL query.
-- But you can still update the query by executing the newer version.
-- It works fine but you also need to provide default params for the
-- query if it has any because we save the query by running it and in this
-- case we don't care about params or the result.
-- https://data.stackexchange.com/stackoverflow/query/edit/1306035

SELECT * FROM Users
WHERE Id = ##userId?1##
