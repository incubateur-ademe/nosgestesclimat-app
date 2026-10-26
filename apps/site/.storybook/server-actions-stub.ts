/**
 * Browser stand-ins for server actions used by server components rendered in
 * stories.
 *
 * Server actions only run on the server in Next. Importing their real modules
 * in the preview pulls the Prisma client and its PostgreSQL driver, which
 * cannot run in a browser.
 */
export const getUserSession = async () => null

export const getUserSimulationJourney = async () => ({
  currentSimulation: undefined,
  completedSimulation: undefined,
})
