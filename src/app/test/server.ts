import { setupServer } from "msw/node"
import { getAllHandlers } from "app/test/handlers"

export const server = setupServer(...getAllHandlers())
