import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "./prismaNamespace.ts";
export type LogOptions<ClientOptions extends Prisma.PrismaClientOptions> = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never;
export interface PrismaClientConstructor {
    /**
   * ## Prisma Client
   *
   * Type-safe database client for TypeScript
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Answers
   * const answers = await prisma.answer.findMany()
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */
    new <Options extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions, LogOpts extends LogOptions<Options> = LogOptions<Options>, OmitOpts extends Prisma.PrismaClientOptions['omit'] = Options extends {
        omit: infer U;
    } ? U : Prisma.PrismaClientOptions['omit'], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs>(options: Prisma.Subset<Options, Prisma.PrismaClientOptions>): PrismaClient<LogOpts, OmitOpts, ExtArgs>;
}
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Answers
 * const answers = await prisma.answer.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export interface PrismaClient<in LogOpts extends Prisma.LogLevel = never, in out OmitOpts extends Prisma.PrismaClientOptions['omit'] = undefined, in out ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['other'];
    };
    $on<V extends LogOpts>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;
    /**
     * Connect with the database
     */
    $connect(): runtime.Types.Utils.JsPromise<void>;
    /**
     * Disconnect from the database
     */
    $disconnect(): runtime.Types.Utils.JsPromise<void>;
    /**
       * Executes a prepared raw query and returns the number of affected rows.
       * @example
       * ```
       * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
       * ```
       *
       * Read more in our [docs](https://pris.ly/d/raw-queries).
       */
    $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;
    /**
     * Executes a raw query and returns the number of affected rows.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;
    /**
     * Performs a prepared raw query and returns the `SELECT` data.
     * @example
     * ```
     * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;
    /**
     * Performs a raw query and returns the `SELECT` data.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;
    /**
     * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
     * @example
     * ```
     * const [george, bob, alice] = await prisma.$transaction([
     *   prisma.user.create({ data: { name: 'George' } }),
     *   prisma.user.create({ data: { name: 'Bob' } }),
     *   prisma.user.create({ data: { name: 'Alice' } }),
     * ])
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
     */
    $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;
    $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => runtime.Types.Utils.JsPromise<R>, options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<R>;
    $extends: runtime.Types.Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<OmitOpts>, ExtArgs, runtime.Types.Utils.Call<Prisma.TypeMapCb<OmitOpts>, {
        extArgs: ExtArgs;
    }>>;
    /**
 * `prisma.answer`: Exposes CRUD operations for the **Answer** model.
  * Example usage:
  * ```ts
  * // Fetch zero or more Answers
  * const answers = await prisma.answer.findMany()
  * ```
  */
    get answer(): Prisma.AnswerDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.brevoNewsletterStats`: Exposes CRUD operations for the **BrevoNewsletterStats** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more BrevoNewsletterStats
      * const brevoNewsletterStats = await prisma.brevoNewsletterStats.findMany()
      * ```
      */
    get brevoNewsletterStats(): Prisma.BrevoNewsletterStatsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.budgetStats`: Exposes CRUD operations for the **BudgetStats** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more BudgetStats
      * const budgetStats = await prisma.budgetStats.findMany()
      * ```
      */
    get budgetStats(): Prisma.BudgetStatsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.emailSimulation`: Exposes CRUD operations for the **EmailSimulation** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more EmailSimulations
      * const emailSimulations = await prisma.emailSimulation.findMany()
      * ```
      */
    get emailSimulation(): Prisma.EmailSimulationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.group`: Exposes CRUD operations for the **Group** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Groups
      * const groups = await prisma.group.findMany()
      * ```
      */
    get group(): Prisma.GroupDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.groupAdministrator`: Exposes CRUD operations for the **GroupAdministrator** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more GroupAdministrators
      * const groupAdministrators = await prisma.groupAdministrator.findMany()
      * ```
      */
    get groupAdministrator(): Prisma.GroupAdministratorDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.groupParticipant`: Exposes CRUD operations for the **GroupParticipant** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more GroupParticipants
      * const groupParticipants = await prisma.groupParticipant.findMany()
      * ```
      */
    get groupParticipant(): Prisma.GroupParticipantDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.integrationApiScope`: Exposes CRUD operations for the **IntegrationApiScope** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more IntegrationApiScopes
      * const integrationApiScopes = await prisma.integrationApiScope.findMany()
      * ```
      */
    get integrationApiScope(): Prisma.IntegrationApiScopeDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.integrationWhitelist`: Exposes CRUD operations for the **IntegrationWhitelist** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more IntegrationWhitelists
      * const integrationWhitelists = await prisma.integrationWhitelist.findMany()
      * ```
      */
    get integrationWhitelist(): Prisma.IntegrationWhitelistDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.job`: Exposes CRUD operations for the **Job** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Jobs
      * const jobs = await prisma.job.findMany()
      * ```
      */
    get job(): Prisma.JobDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.jobExecution`: Exposes CRUD operations for the **JobExecution** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more JobExecutions
      * const jobExecutions = await prisma.jobExecution.findMany()
      * ```
      */
    get jobExecution(): Prisma.JobExecutionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.matomoStats`: Exposes CRUD operations for the **MatomoStats** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more MatomoStats
      * const matomoStats = await prisma.matomoStats.findMany()
      * ```
      */
    get matomoStats(): Prisma.MatomoStatsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.northstarRating`: Exposes CRUD operations for the **NorthstarRating** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more NorthstarRatings
      * const northstarRatings = await prisma.northstarRating.findMany()
      * ```
      */
    get northstarRating(): Prisma.NorthstarRatingDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.organisation`: Exposes CRUD operations for the **Organisation** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Organisations
      * const organisations = await prisma.organisation.findMany()
      * ```
      */
    get organisation(): Prisma.OrganisationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.organisationAdministrator`: Exposes CRUD operations for the **OrganisationAdministrator** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more OrganisationAdministrators
      * const organisationAdministrators = await prisma.organisationAdministrator.findMany()
      * ```
      */
    get organisationAdministrator(): Prisma.OrganisationAdministratorDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.poll`: Exposes CRUD operations for the **Poll** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Polls
      * const polls = await prisma.poll.findMany()
      * ```
      */
    get poll(): Prisma.PollDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.pollDefaultAdditionalQuestion`: Exposes CRUD operations for the **PollDefaultAdditionalQuestion** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more PollDefaultAdditionalQuestions
      * const pollDefaultAdditionalQuestions = await prisma.pollDefaultAdditionalQuestion.findMany()
      * ```
      */
    get pollDefaultAdditionalQuestion(): Prisma.PollDefaultAdditionalQuestionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.quizzAnswer`: Exposes CRUD operations for the **QuizzAnswer** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more QuizzAnswers
      * const quizzAnswers = await prisma.quizzAnswer.findMany()
      * ```
      */
    get quizzAnswer(): Prisma.QuizzAnswerDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.simulation`: Exposes CRUD operations for the **Simulation** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Simulations
      * const simulations = await prisma.simulation.findMany()
      * ```
      */
    get simulation(): Prisma.SimulationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.simulationState`: Exposes CRUD operations for the **SimulationState** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more SimulationStates
      * const simulationStates = await prisma.simulationState.findMany()
      * ```
      */
    get simulationState(): Prisma.SimulationStateDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.simulationAdditionalQuestionAnswer`: Exposes CRUD operations for the **SimulationAdditionalQuestionAnswer** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more SimulationAdditionalQuestionAnswers
      * const simulationAdditionalQuestionAnswers = await prisma.simulationAdditionalQuestionAnswer.findMany()
      * ```
      */
    get simulationAdditionalQuestionAnswer(): Prisma.SimulationAdditionalQuestionAnswerDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.simulationPoll`: Exposes CRUD operations for the **SimulationPoll** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more SimulationPolls
      * const simulationPolls = await prisma.simulationPoll.findMany()
      * ```
      */
    get simulationPoll(): Prisma.SimulationPollDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.survey`: Exposes CRUD operations for the **Survey** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Surveys
      * const surveys = await prisma.survey.findMany()
      * ```
      */
    get survey(): Prisma.SurveyDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.user`: Exposes CRUD operations for the **User** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Users
      * const users = await prisma.user.findMany()
      * ```
      */
    get user(): Prisma.UserDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.verificationCode`: Exposes CRUD operations for the **VerificationCode** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more VerificationCodes
      * const verificationCodes = await prisma.verificationCode.findMany()
      * ```
      */
    get verificationCode(): Prisma.VerificationCodeDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.verifiedUser`: Exposes CRUD operations for the **VerifiedUser** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more VerifiedUsers
      * const verifiedUsers = await prisma.verifiedUser.findMany()
      * ```
      */
    get verifiedUser(): Prisma.VerifiedUserDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.computedResultsView`: Exposes CRUD operations for the **ComputedResultsView** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ComputedResultsViews
      * const computedResultsViews = await prisma.computedResultsView.findMany()
      * ```
      */
    get computedResultsView(): Prisma.ComputedResultsViewDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.anonSimulation`: Exposes CRUD operations for the **AnonSimulation** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more AnonSimulations
      * const anonSimulations = await prisma.anonSimulation.findMany()
      * ```
      */
    get anonSimulation(): Prisma.AnonSimulationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.anonVerifiedUser`: Exposes CRUD operations for the **AnonVerifiedUser** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more AnonVerifiedUsers
      * const anonVerifiedUsers = await prisma.anonVerifiedUser.findMany()
      * ```
      */
    get anonVerifiedUser(): Prisma.AnonVerifiedUserDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.anonOrganisation`: Exposes CRUD operations for the **AnonOrganisation** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more AnonOrganisations
      * const anonOrganisations = await prisma.anonOrganisation.findMany()
      * ```
      */
    get anonOrganisation(): Prisma.AnonOrganisationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.anonOrganisationAdministrator`: Exposes CRUD operations for the **AnonOrganisationAdministrator** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more AnonOrganisationAdministrators
      * const anonOrganisationAdministrators = await prisma.anonOrganisationAdministrator.findMany()
      * ```
      */
    get anonOrganisationAdministrator(): Prisma.AnonOrganisationAdministratorDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.anonPoll`: Exposes CRUD operations for the **AnonPoll** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more AnonPolls
      * const anonPolls = await prisma.anonPoll.findMany()
      * ```
      */
    get anonPoll(): Prisma.AnonPollDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.anonSimulationPoll`: Exposes CRUD operations for the **AnonSimulationPoll** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more AnonSimulationPolls
      * const anonSimulationPolls = await prisma.anonSimulationPoll.findMany()
      * ```
      */
    get anonSimulationPoll(): Prisma.AnonSimulationPollDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
}
export declare function getPrismaClientClass(): PrismaClientConstructor;
