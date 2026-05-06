export declare const ApiScopeName: {
    readonly ngc: "ngc";
    readonly agir: "agir";
    readonly two_tons: "two_tons";
};
export type ApiScopeName = (typeof ApiScopeName)[keyof typeof ApiScopeName];
export declare const JobStatus: {
    readonly pending: "pending";
    readonly running: "running";
    readonly success: "success";
    readonly failure: "failure";
};
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
export declare const MatomoStatsSource: {
    readonly beta: "beta";
    readonly data: "data";
};
export type MatomoStatsSource = (typeof MatomoStatsSource)[keyof typeof MatomoStatsSource];
export declare const MatomoStatsDevice: {
    readonly desktop: "desktop";
    readonly all: "all";
};
export type MatomoStatsDevice = (typeof MatomoStatsDevice)[keyof typeof MatomoStatsDevice];
export declare const NorthstarRatingType: {
    readonly learned: "learned";
    readonly actions: "actions";
};
export type NorthstarRatingType = (typeof NorthstarRatingType)[keyof typeof NorthstarRatingType];
export declare const OrganisationType: {
    readonly association: "association";
    readonly company: "company";
    readonly cooperative: "cooperative";
    readonly groupOfFriends: "groupOfFriends";
    readonly other: "other";
    readonly publicOrRegionalAuthority: "publicOrRegionalAuthority";
    readonly universityOrSchool: "universityOrSchool";
};
export type OrganisationType = (typeof OrganisationType)[keyof typeof OrganisationType];
export declare const PollDefaultAdditionalQuestionType: {
    readonly postalCode: "postalCode";
    readonly birthdate: "birthdate";
};
export type PollDefaultAdditionalQuestionType = (typeof PollDefaultAdditionalQuestionType)[keyof typeof PollDefaultAdditionalQuestionType];
export declare const QuizzAnswerIsAnswerCorrect: {
    readonly correct: "correct";
    readonly almost: "almost";
    readonly wrong: "wrong";
};
export type QuizzAnswerIsAnswerCorrect = (typeof QuizzAnswerIsAnswerCorrect)[keyof typeof QuizzAnswerIsAnswerCorrect];
export declare const SimulationAdditionalQuestionAnswerType: {
    readonly custom: "custom";
    readonly default: "default";
};
export type SimulationAdditionalQuestionAnswerType = (typeof SimulationAdditionalQuestionAnswerType)[keyof typeof SimulationAdditionalQuestionAnswerType];
export declare const StatsKind: {
    readonly campaign: "campaign";
    readonly direct: "direct";
    readonly search: "search";
    readonly social: "social";
    readonly website: "website";
    readonly aiAgent: "aiAgent";
    readonly all: "all";
};
export type StatsKind = (typeof StatsKind)[keyof typeof StatsKind];
export declare const VerificationCodeMode: {
    readonly signIn: "signIn";
    readonly signUp: "signUp";
};
export type VerificationCodeMode = (typeof VerificationCodeMode)[keyof typeof VerificationCodeMode];
