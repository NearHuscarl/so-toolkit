# Stackoverflow Toolkit

## Development

* Clone this project
* Register Your V2.0 Application on [stackapps](https://stackapps.com/apps/oauth/register)
to get a `key`. Pass this `key` when making requests using Stack Exchange API 
to receive a higher request quota (10,000 vs 200 per day).
* Create `.env.local` file in your root directory with the following content:

```
REACT_APP_STACK_APP_KEY=your_key
REACT_APP_STACK_APP_CLIENT_ID=your_client_id
```

* Start the dev server

```
npm start
```

### Updating SQL queries (for me only)
* Create `.env.development.local` file in my root directory with the following content:

```
SE_EMAIL=email
SE_PASSWORD=password
```

* Modify any SQL file in `sql/`
* Run `npm run commit` to get the new revision id of the query
* Open `src/app/sqlQueries.ts` to see the result

<!--
* Setup stackapps to use OAuth2: See [this answer](https://stackapps.com/a/6638/72145) 
-->
