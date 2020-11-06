// @ts-ignore
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
  changed: boolean
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

async function getQueries() {
  const changedSqlFiles = new Set<string>(
    (await getChangedFiles())
      .filter((p) => p.startsWith("sql/"))
      .map((p) => path.normalize(p))
  )
  const allQueryFiles = ((await fs.readdir("sql/")) as string[]).map((f) =>
    path.join("sql", f)
  )
  const promises = allQueryFiles.map(async (path) => {
    const content = await fs.readFile(path, "utf8")
    const lines = content.split(EOL)
    const changed = changedSqlFiles.has(path)
    const queryId = parseFloat(
      lines
        .find((line) => line.startsWith("-- QueryID="))
        ?.match(/QueryID=(\d+)/)[1]
    )
    const title = lines
      .find((line) => line.startsWith("-- Title="))
      ?.match(/Title=(.+)/)[1]
    const description = lines
      .find((line) => line.startsWith("-- Description="))
      ?.match(/Description=(.+)/)[1]

    const result: SqlQuery = {
      path,
      content,
      queryId,
      title,
      description,
      changed,
    }
    validateQuery(result)
    return result
  })

  return await Promise.all(promises)
}

function handleError(e) {
  if (e.isAxiosError) {
    console.error(e.response.data)
  }

  throw new Error(e)
}

async function authenticate() {
  const loginData = getLoginData()
  const body = new URLSearchParams(loginData)

  try {
    const response = await getApi().post("/auth", body)

    devEnvs.SEDE_AUTH_COOKIE = response.data.authCookie
    await fs.writeFile(".env.development.local", stringify(devEnvs))
    console.log("Retrieved Auth Cookie.")
  } catch (e) {
    handleError(e)
    process.exit(1)
  }
}

function getLoginData() {
  if (!process.env.SE_EMAIL || !process.env.SE_PASSWORD) {
    console.error(
      "Require Stack Exchange email and password to commit changed queries to SEDE"
    )
    process.exit(9)
  }

  return {
    email: process.env.SE_EMAIL,
    password: process.env.SE_PASSWORD,
  }
}

async function checkAuth() {
  if (!devEnvs.SEDE_AUTH_COOKIE) {
    console.log("SEDE Auth Cookie not found. Login now...")
    await authenticate()
  }
}

let revisionIds = [] as any[]
async function saveQuery(sqlQuery: SqlQuery, retry: boolean = true) {
  try {
    const {
      queryId,
      title,
      description = "",
      content: sql,
      path,
      changed,
    } = sqlQuery

    if (!changed) {
      if (revisionIds.length === 0) {
        revisionIds = JSON.parse(
          await fs.readFile("scripts/revisionIds.json", "utf8")
        )
      }
      const { revisionId } = revisionIds.find((r) => r.path === path)
      return { ...sqlQuery, revisionId } as SqlQueryResult
    }

    console.log(`Updating query ${path}`)
    const body = new URLSearchParams({ title, description, sql })
    const headers = { "auth-cookie": devEnvs.SEDE_AUTH_COOKIE }
    const response = await getApi().post(`/query/save/1/${queryId}`, body, {
      headers,
    })
    const { revisionId } = response.data

    return { ...sqlQuery, revisionId } as SqlQueryResult
  } catch (e) {
    if (e.response?.data?.error?.startsWith("Need captcha") && retry) {
      console.log("auth cookie is expired. Try to login again...")
      await authenticate()
      return await saveQuery(sqlQuery, false)
    }

    handleError(e)
    process.exit(1)
  }
}

async function updateMigration(results: SqlQueryResult[]) {
  await fs.writeFile(
    "scripts/revisionIds.json",
    JSON.stringify(
      results.map((r) => ({ revisionId: r.revisionId, path: r.path }))
    ),
    "utf8"
  )

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

  const queries = await getQueries()
  const results = await Promise.all(queries.map((q) => saveQuery(q)))

  await updateMigration(results)
}

main().then(() => {})
