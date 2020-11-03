const env = require("dotenv").config({ path: ".env.development.local" })
const { stringify } = require("envfile")
const fs = require("fs").promises
const util = require("util")
const axios = require("axios")
const memoize = require("lodash").memoize
const snakeCase = require("lodash").snakeCase
const childProcess = require("child_process")
const path = require("path")
const { EOL } = require("os")
const exec = util.promisify(childProcess.exec)
const devEnvs = env.parsed

async function getChangedFiles() {
  const { stdout } = await exec("git diff --name-only")
  return stdout.split("\n").filter(Boolean)
}

type SqlQuery = {
  path: string
  content: string
  queryId: number
  title: string
  description?: string
}

type SqlQueryResult = SqlQuery & {
  revisionId: number
}

const getApi = memoize(() => {
  return axios.create({
    baseURL: "https://sede-auth.herokuapp.com",
  })
})

function validateQuery(sqlQuery: SqlQuery) {
  const { path, queryId, title } = sqlQuery

  if (!title) {
    console.error(`${path}: Title is required.`)
    process.exit(9)
  }

  if (typeof queryId !== "number") {
    console.error(
      `${path}: queryId must exist and is a number. Received: ${queryId}.`
    )
    process.exit(9)
  }
}

async function getChangedQueries() {
  const changedFiles: string[] = await getChangedFiles()
  const promises = changedFiles
    .filter((p) => p.startsWith("sql/"))
    .map(async (path) => {
      const content = await fs.readFile(path, "utf8")
      const lines = content.split(EOL)
      const queryId = parseFloat(
        lines
          .find((line) => line.startsWith("-- QueryID="))
          .match(/QueryID=(\d+)/)[1]
      )
      const title = lines
        .find((line) => line.startsWith("-- Title="))
        .match(/Title=(.+)/)[1]
      const description = lines
        .find((line) => line.startsWith("-- Description="))
        ?.match(/Description=(.+)/)[1]

      const result: SqlQuery = { path, content, queryId, title, description }
      validateQuery(result)
      return result
    })

  return await Promise.all(promises)
}

async function checkAuth() {
  if (!process.env.SE_EMAIL || !process.env.SE_PASSWORD) {
    console.error(
      "Require Stack Exchange email and password to commit changed queries to SEDE"
    )
    process.exit(9)
  }

  if (!devEnvs.SEDE_AUTH_COOKIE) {
    console.log("SEDE Auth Cookie not found. Login now...")
    const body = new URLSearchParams({
      email: process.env.SE_EMAIL,
      password: process.env.SE_PASSWORD,
    })

    try {
      const response = await getApi().post("/auth", body)

      devEnvs.SEDE_AUTH_COOKIE = response.data.authCookie
      await fs.writeFile(".env.development.local", stringify(devEnvs))
      console.log("Retrieved Auth Cookie.")
    } catch (e) {
      console.error(e.response.data)
      process.exit(1)
    }
  }
}

async function saveQuery(sqlQuery: SqlQuery) {
  const { queryId, title, description = "", content: sql, path } = sqlQuery
  console.log(`Updating query ${path}`)
  const body = new URLSearchParams({ title, description, sql })

  try {
    const headers = { "auth-cookie": devEnvs.SEDE_AUTH_COOKIE }
    const response = await getApi().post(`/query/save/1/${queryId}`, body, {
      headers,
    })
    const { revisionId } = response.data

    return { ...sqlQuery, revisionId } as SqlQueryResult
  } catch (e) {
    console.error(e.response.data)
    process.exit(1)
  }
}

async function updateMigration(results: SqlQueryResult[]) {
  const lines = [] as string[]
  const warning =
    "// This file is auto generated via 'npm run commit' command. Do not touch."

  lines.push(warning)
  lines.push(EOL)

  for (const query of results) {
    const { path: queryPath, revisionId, title, description, queryId } = query
    const filename = path.basename(queryPath, path.extname(queryPath))
    const varName = snakeCase(filename).toUpperCase() + "_REVISION_ID"
    const queryLink = "https://data.stackexchange.com/stackoverflow/query"

    lines.push(`// Title: ${title}`)
    if (description) lines.push(`// Description: ${description}`)
    lines.push(`// Query link: ${queryLink}/${queryId}`)
    lines.push(`export const ${varName} = ${revisionId}`)
    lines.push(EOL)
  }

  await fs.writeFile("src/app/sqlQueries.ts", lines.join(EOL))
}

async function main() {
  await checkAuth()

  const queries = await getChangedQueries()
  const results = await Promise.all(queries.map((q) => saveQuery(q)))

  await updateMigration(results)
}

// TODO:
// update AUTH_COOKIE if capdatchas
main()

export {}
