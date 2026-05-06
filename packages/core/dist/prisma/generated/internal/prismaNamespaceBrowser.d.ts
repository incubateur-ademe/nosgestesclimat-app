import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.ts';
export type * from './prismaNamespace.ts';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: import("@prisma/client/runtime/client").DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: import("@prisma/client/runtime/client").JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: import("@prisma/client/runtime/client").AnyNullClass;
export declare const ModelName: {
    readonly Answer: "Answer";
    readonly BrevoNewsletterStats: "BrevoNewsletterStats";
    readonly BudgetStats: "BudgetStats";
    readonly EmailSimulation: "EmailSimulation";
    readonly Group: "Group";
    readonly GroupAdministrator: "GroupAdministrator";
    readonly GroupParticipant: "GroupParticipant";
    readonly IntegrationApiScope: "IntegrationApiScope";
    readonly IntegrationWhitelist: "IntegrationWhitelist";
    readonly Job: "Job";
    readonly JobExecution: "JobExecution";
    readonly MatomoStats: "MatomoStats";
    readonly NorthstarRating: "NorthstarRating";
    readonly Organisation: "Organisation";
    readonly OrganisationAdministrator: "OrganisationAdministrator";
    readonly Poll: "Poll";
    readonly PollDefaultAdditionalQuestion: "PollDefaultAdditionalQuestion";
    readonly QuizzAnswer: "QuizzAnswer";
    readonly Simulation: "Simulation";
    readonly SimulationState: "SimulationState";
    readonly SimulationAdditionalQuestionAnswer: "SimulationAdditionalQuestionAnswer";
    readonly SimulationPoll: "SimulationPoll";
    readonly Survey: "Survey";
    readonly User: "User";
    readonly VerificationCode: "VerificationCode";
    readonly VerifiedUser: "VerifiedUser";
    readonly ComputedResultsView: "ComputedResultsView";
    readonly AnonSimulation: "AnonSimulation";
    readonly AnonVerifiedUser: "AnonVerifiedUser";
    readonly AnonOrganisation: "AnonOrganisation";
    readonly AnonOrganisationAdministrator: "AnonOrganisationAdministrator";
    readonly AnonPoll: "AnonPoll";
    readonly AnonSimulationPoll: "AnonSimulationPoll";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const AnswerScalarFieldEnum: {
    readonly id: "id";
    readonly survey: "survey";
    readonly total: "total";
    readonly progress: "progress";
    readonly byCategory: "byCategory";
    readonly context: "context";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type AnswerScalarFieldEnum = (typeof AnswerScalarFieldEnum)[keyof typeof AnswerScalarFieldEnum];
export declare const BrevoNewsletterStatsScalarFieldEnum: {
    readonly id: "id";
    readonly date: "date";
    readonly newsletter: "newsletter";
    readonly subscriptions: "subscriptions";
};
export type BrevoNewsletterStatsScalarFieldEnum = (typeof BrevoNewsletterStatsScalarFieldEnum)[keyof typeof BrevoNewsletterStatsScalarFieldEnum];
export declare const BudgetStatsScalarFieldEnum: {
    readonly id: "id";
    readonly year: "year";
    readonly month: "month";
    readonly kind: "kind";
    readonly referrer: "referrer";
    readonly totalBudget: "totalBudget";
    readonly acquisitionBudget: "acquisitionBudget";
};
export type BudgetStatsScalarFieldEnum = (typeof BudgetStatsScalarFieldEnum)[keyof typeof BudgetStatsScalarFieldEnum];
export declare const EmailSimulationScalarFieldEnum: {
    readonly id: "id";
    readonly data: "data";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type EmailSimulationScalarFieldEnum = (typeof EmailSimulationScalarFieldEnum)[keyof typeof EmailSimulationScalarFieldEnum];
export declare const GroupScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly emoji: "emoji";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type GroupScalarFieldEnum = (typeof GroupScalarFieldEnum)[keyof typeof GroupScalarFieldEnum];
export declare const GroupAdministratorScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly groupId: "groupId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type GroupAdministratorScalarFieldEnum = (typeof GroupAdministratorScalarFieldEnum)[keyof typeof GroupAdministratorScalarFieldEnum];
export declare const GroupParticipantScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly simulationId: "simulationId";
    readonly groupId: "groupId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type GroupParticipantScalarFieldEnum = (typeof GroupParticipantScalarFieldEnum)[keyof typeof GroupParticipantScalarFieldEnum];
export declare const IntegrationApiScopeScalarFieldEnum: {
    readonly name: "name";
    readonly description: "description";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type IntegrationApiScopeScalarFieldEnum = (typeof IntegrationApiScopeScalarFieldEnum)[keyof typeof IntegrationApiScopeScalarFieldEnum];
export declare const IntegrationWhitelistScalarFieldEnum: {
    readonly id: "id";
    readonly emailPattern: "emailPattern";
    readonly description: "description";
    readonly apiScopeName: "apiScopeName";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type IntegrationWhitelistScalarFieldEnum = (typeof IntegrationWhitelistScalarFieldEnum)[keyof typeof IntegrationWhitelistScalarFieldEnum];
export declare const JobScalarFieldEnum: {
    readonly id: "id";
    readonly status: "status";
    readonly params: "params";
    readonly result: "result";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type JobScalarFieldEnum = (typeof JobScalarFieldEnum)[keyof typeof JobScalarFieldEnum];
export declare const JobExecutionScalarFieldEnum: {
    readonly id: "id";
    readonly jobId: "jobId";
    readonly date: "date";
};
export type JobExecutionScalarFieldEnum = (typeof JobExecutionScalarFieldEnum)[keyof typeof JobExecutionScalarFieldEnum];
export declare const MatomoStatsScalarFieldEnum: {
    readonly id: "id";
    readonly date: "date";
    readonly source: "source";
    readonly kind: "kind";
    readonly referrer: "referrer";
    readonly device: "device";
    readonly iframe: "iframe";
    readonly visits: "visits";
    readonly firstAnswer: "firstAnswer";
    readonly finishedSimulations: "finishedSimulations";
};
export type MatomoStatsScalarFieldEnum = (typeof MatomoStatsScalarFieldEnum)[keyof typeof MatomoStatsScalarFieldEnum];
export declare const NorthstarRatingScalarFieldEnum: {
    readonly id: "id";
    readonly simulationId: "simulationId";
    readonly type: "type";
    readonly value: "value";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type NorthstarRatingScalarFieldEnum = (typeof NorthstarRatingScalarFieldEnum)[keyof typeof NorthstarRatingScalarFieldEnum];
export declare const OrganisationScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly slug: "slug";
    readonly type: "type";
    readonly numberOfCollaborators: "numberOfCollaborators";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type OrganisationScalarFieldEnum = (typeof OrganisationScalarFieldEnum)[keyof typeof OrganisationScalarFieldEnum];
export declare const OrganisationAdministratorScalarFieldEnum: {
    readonly id: "id";
    readonly userEmail: "userEmail";
    readonly organisationId: "organisationId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type OrganisationAdministratorScalarFieldEnum = (typeof OrganisationAdministratorScalarFieldEnum)[keyof typeof OrganisationAdministratorScalarFieldEnum];
export declare const PollScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly slug: "slug";
    readonly funFacts: "funFacts";
    readonly computedResults: "computedResults";
    readonly expectedNumberOfParticipants: "expectedNumberOfParticipants";
    readonly customAdditionalQuestions: "customAdditionalQuestions";
    readonly organisationId: "organisationId";
    readonly computeRealTimeStats: "computeRealTimeStats";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PollScalarFieldEnum = (typeof PollScalarFieldEnum)[keyof typeof PollScalarFieldEnum];
export declare const PollDefaultAdditionalQuestionScalarFieldEnum: {
    readonly id: "id";
    readonly pollId: "pollId";
    readonly type: "type";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PollDefaultAdditionalQuestionScalarFieldEnum = (typeof PollDefaultAdditionalQuestionScalarFieldEnum)[keyof typeof PollDefaultAdditionalQuestionScalarFieldEnum];
export declare const QuizzAnswerScalarFieldEnum: {
    readonly id: "id";
    readonly simulationId: "simulationId";
    readonly isAnswerCorrect: "isAnswerCorrect";
    readonly answer: "answer";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type QuizzAnswerScalarFieldEnum = (typeof QuizzAnswerScalarFieldEnum)[keyof typeof QuizzAnswerScalarFieldEnum];
export declare const SimulationScalarFieldEnum: {
    readonly id: "id";
    readonly date: "date";
    readonly progression: "progression";
    readonly model: "model";
    readonly computedResults: "computedResults";
    readonly actionChoices: "actionChoices";
    readonly situation: "situation";
    readonly extendedSituation: "extendedSituation";
    readonly foldedSteps: "foldedSteps";
    readonly userId: "userId";
    readonly userEmail: "userEmail";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type SimulationScalarFieldEnum = (typeof SimulationScalarFieldEnum)[keyof typeof SimulationScalarFieldEnum];
export declare const SimulationStateScalarFieldEnum: {
    readonly id: "id";
    readonly date: "date";
    readonly simulationId: "simulationId";
    readonly progression: "progression";
};
export type SimulationStateScalarFieldEnum = (typeof SimulationStateScalarFieldEnum)[keyof typeof SimulationStateScalarFieldEnum];
export declare const SimulationAdditionalQuestionAnswerScalarFieldEnum: {
    readonly id: "id";
    readonly type: "type";
    readonly simulationId: "simulationId";
    readonly key: "key";
    readonly answer: "answer";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type SimulationAdditionalQuestionAnswerScalarFieldEnum = (typeof SimulationAdditionalQuestionAnswerScalarFieldEnum)[keyof typeof SimulationAdditionalQuestionAnswerScalarFieldEnum];
export declare const SimulationPollScalarFieldEnum: {
    readonly id: "id";
    readonly pollId: "pollId";
    readonly simulationId: "simulationId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type SimulationPollScalarFieldEnum = (typeof SimulationPollScalarFieldEnum)[keyof typeof SimulationPollScalarFieldEnum];
export declare const SurveyScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly contextFile: "contextFile";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type SurveyScalarFieldEnum = (typeof SurveyScalarFieldEnum)[keyof typeof SurveyScalarFieldEnum];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly email: "email";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const VerificationCodeScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly mode: "mode";
    readonly code: "code";
    readonly expirationDate: "expirationDate";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type VerificationCodeScalarFieldEnum = (typeof VerificationCodeScalarFieldEnum)[keyof typeof VerificationCodeScalarFieldEnum];
export declare const VerifiedUserScalarFieldEnum: {
    readonly email: "email";
    readonly id: "id";
    readonly name: "name";
    readonly telephone: "telephone";
    readonly position: "position";
    readonly optedInForCommunications: "optedInForCommunications";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type VerifiedUserScalarFieldEnum = (typeof VerifiedUserScalarFieldEnum)[keyof typeof VerifiedUserScalarFieldEnum];
export declare const ComputedResultsViewScalarFieldEnum: {
    readonly id: "id";
    readonly date: "date";
    readonly progression: "progression";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly bilanCarbone: "bilanCarbone";
    readonly transportCarbone: "transportCarbone";
    readonly alimentationCarbone: "alimentationCarbone";
    readonly logementCarbone: "logementCarbone";
    readonly diversCarbone: "diversCarbone";
    readonly bilanEauJour: "bilanEauJour";
    readonly transportEauJour: "transportEauJour";
    readonly alimentationEauJour: "alimentationEauJour";
    readonly logementEauJour: "logementEauJour";
    readonly diversEauJour: "diversEauJour";
};
export type ComputedResultsViewScalarFieldEnum = (typeof ComputedResultsViewScalarFieldEnum)[keyof typeof ComputedResultsViewScalarFieldEnum];
export declare const AnonSimulationScalarFieldEnum: {
    readonly id: "id";
    readonly date: "date";
    readonly progression: "progression";
    readonly model: "model";
    readonly computedResults: "computedResults";
    readonly actionChoices: "actionChoices";
    readonly situation: "situation";
    readonly foldedSteps: "foldedSteps";
    readonly userId: "userId";
    readonly userEmail: "userEmail";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type AnonSimulationScalarFieldEnum = (typeof AnonSimulationScalarFieldEnum)[keyof typeof AnonSimulationScalarFieldEnum];
export declare const AnonVerifiedUserScalarFieldEnum: {
    readonly id: "id";
    readonly user_id: "user_id";
    readonly name: "name";
    readonly telephone: "telephone";
    readonly position: "position";
    readonly optedInForCommunications: "optedInForCommunications";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type AnonVerifiedUserScalarFieldEnum = (typeof AnonVerifiedUserScalarFieldEnum)[keyof typeof AnonVerifiedUserScalarFieldEnum];
export declare const AnonOrganisationScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly slug: "slug";
    readonly type: "type";
    readonly numberOfCollaborators: "numberOfCollaborators";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type AnonOrganisationScalarFieldEnum = (typeof AnonOrganisationScalarFieldEnum)[keyof typeof AnonOrganisationScalarFieldEnum];
export declare const AnonOrganisationAdministratorScalarFieldEnum: {
    readonly id: "id";
    readonly userEmail: "userEmail";
    readonly organisationId: "organisationId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type AnonOrganisationAdministratorScalarFieldEnum = (typeof AnonOrganisationAdministratorScalarFieldEnum)[keyof typeof AnonOrganisationAdministratorScalarFieldEnum];
export declare const AnonPollScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly slug: "slug";
    readonly funFacts: "funFacts";
    readonly computedResults: "computedResults";
    readonly expectedNumberOfParticipants: "expectedNumberOfParticipants";
    readonly customAdditionalQuestions: "customAdditionalQuestions";
    readonly computeRealTimeStats: "computeRealTimeStats";
    readonly organisationId: "organisationId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type AnonPollScalarFieldEnum = (typeof AnonPollScalarFieldEnum)[keyof typeof AnonPollScalarFieldEnum];
export declare const AnonSimulationPollScalarFieldEnum: {
    readonly id: "id";
    readonly pollId: "pollId";
    readonly simulationId: "simulationId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type AnonSimulationPollScalarFieldEnum = (typeof AnonSimulationPollScalarFieldEnum)[keyof typeof AnonSimulationPollScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const JsonNullValueInput: {
    readonly JsonNull: import("@prisma/client/runtime/client").JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: import("@prisma/client/runtime/client").DbNullClass;
    readonly JsonNull: import("@prisma/client/runtime/client").JsonNullClass;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const JsonNullValueFilter: {
    readonly DbNull: import("@prisma/client/runtime/client").DbNullClass;
    readonly JsonNull: import("@prisma/client/runtime/client").JsonNullClass;
    readonly AnyNull: import("@prisma/client/runtime/client").AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
