import { setupWorker } from "msw"
import { getAllHandlers } from "app/test/handlers"

export const browser = setupWorker(...getAllHandlers())
