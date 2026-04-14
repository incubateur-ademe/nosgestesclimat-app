import { HttpHandler } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from 'vitest'

export const mswServer = setupServer()

export const resetMswServer = () => {
  for (const handler of mswServer.listHandlers()) {
    if (handler instanceof HttpHandler) {
      expect(handler.isUsed).toBeTruthy()
    }
  }

  mswServer.resetHandlers()
}
