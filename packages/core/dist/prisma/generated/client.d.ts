import * as runtime from "@prisma/client/runtime/client";
import * as $Class from "./internal/class.ts";
import * as Prisma from "./internal/prismaNamespace.ts";
export * as $Enums from './enums.ts';
export * from "./enums.ts";
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
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model Answer
 *
 */
export type Answer = Prisma.AnswerModel;
/**
 * Model BrevoNewsletterStats
 *
 */
export type BrevoNewsletterStats = Prisma.BrevoNewsletterStatsModel;
/**
 * Model BudgetStats
 *
 */
export type BudgetStats = Prisma.BudgetStatsModel;
/**
 * Model EmailSimulation
 *
 */
export type EmailSimulation = Prisma.EmailSimulationModel;
/**
 * Model Group
 *
 */
export type Group = Prisma.GroupModel;
/**
 * Model GroupAdministrator
 *
 */
export type GroupAdministrator = Prisma.GroupAdministratorModel;
/**
 * Model GroupParticipant
 *
 */
export type GroupParticipant = Prisma.GroupParticipantModel;
/**
 * Model IntegrationApiScope
 *
 */
export type IntegrationApiScope = Prisma.IntegrationApiScopeModel;
/**
 * Model IntegrationWhitelist
 *
 */
export type IntegrationWhitelist = Prisma.IntegrationWhitelistModel;
/**
 * Model Job
 *
 */
export type Job = Prisma.JobModel;
/**
 * Model JobExecution
 *
 */
export type JobExecution = Prisma.JobExecutionModel;
/**
 * Model MatomoStats
 *
 */
export type MatomoStats = Prisma.MatomoStatsModel;
/**
 * Model NorthstarRating
 *
 */
export type NorthstarRating = Prisma.NorthstarRatingModel;
/**
 * Model Organisation
 *
 */
export type Organisation = Prisma.OrganisationModel;
/**
 * Model OrganisationAdministrator
 *
 */
export type OrganisationAdministrator = Prisma.OrganisationAdministratorModel;
/**
 * Model Poll
 *
 */
export type Poll = Prisma.PollModel;
/**
 * Model PollDefaultAdditionalQuestion
 *
 */
export type PollDefaultAdditionalQuestion = Prisma.PollDefaultAdditionalQuestionModel;
/**
 * Model QuizzAnswer
 *
 */
export type QuizzAnswer = Prisma.QuizzAnswerModel;
/**
 * Model Simulation
 *
 */
export type Simulation = Prisma.SimulationModel;
/**
 * Model SimulationState
 *
 */
export type SimulationState = Prisma.SimulationStateModel;
/**
 * Model SimulationAdditionalQuestionAnswer
 *
 */
export type SimulationAdditionalQuestionAnswer = Prisma.SimulationAdditionalQuestionAnswerModel;
/**
 * Model SimulationPoll
 *
 */
export type SimulationPoll = Prisma.SimulationPollModel;
/**
 * Model Survey
 *
 */
export type Survey = Prisma.SurveyModel;
/**
 * Model User
 *
 */
export type User = Prisma.UserModel;
/**
 * Model VerificationCode
 *
 */
export type VerificationCode = Prisma.VerificationCodeModel;
/**
 * Model VerifiedUser
 *
 */
export type VerifiedUser = Prisma.VerifiedUserModel;
/**
 * Model ComputedResultsView
 *
 */
export type ComputedResultsView = Prisma.ComputedResultsViewModel;
/**
 * Model AnonSimulation
 *
 */
export type AnonSimulation = Prisma.AnonSimulationModel;
/**
 * Model AnonVerifiedUser
 *
 */
export type AnonVerifiedUser = Prisma.AnonVerifiedUserModel;
/**
 * Model AnonOrganisation
 *
 */
export type AnonOrganisation = Prisma.AnonOrganisationModel;
/**
 * Model AnonOrganisationAdministrator
 *
 */
export type AnonOrganisationAdministrator = Prisma.AnonOrganisationAdministratorModel;
/**
 * Model AnonPoll
 *
 */
export type AnonPoll = Prisma.AnonPollModel;
/**
 * Model AnonSimulationPoll
 *
 */
export type AnonSimulationPoll = Prisma.AnonSimulationPollModel;
