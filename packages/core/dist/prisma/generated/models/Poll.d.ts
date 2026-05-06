import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.ts";
/**
 * Model Poll
 *
 */
export type PollModel = runtime.Types.Result.DefaultSelection<Prisma.$PollPayload>;
export type AggregatePoll = {
    _count: PollCountAggregateOutputType | null;
    _avg: PollAvgAggregateOutputType | null;
    _sum: PollSumAggregateOutputType | null;
    _min: PollMinAggregateOutputType | null;
    _max: PollMaxAggregateOutputType | null;
};
export type PollAvgAggregateOutputType = {
    expectedNumberOfParticipants: number | null;
};
export type PollSumAggregateOutputType = {
    expectedNumberOfParticipants: number | null;
};
export type PollMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    slug: string | null;
    expectedNumberOfParticipants: number | null;
    organisationId: string | null;
    computeRealTimeStats: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type PollMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    slug: string | null;
    expectedNumberOfParticipants: number | null;
    organisationId: string | null;
    computeRealTimeStats: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type PollCountAggregateOutputType = {
    id: number;
    name: number;
    slug: number;
    funFacts: number;
    computedResults: number;
    expectedNumberOfParticipants: number;
    customAdditionalQuestions: number;
    organisationId: number;
    computeRealTimeStats: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type PollAvgAggregateInputType = {
    expectedNumberOfParticipants?: true;
};
export type PollSumAggregateInputType = {
    expectedNumberOfParticipants?: true;
};
export type PollMinAggregateInputType = {
    id?: true;
    name?: true;
    slug?: true;
    expectedNumberOfParticipants?: true;
    organisationId?: true;
    computeRealTimeStats?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type PollMaxAggregateInputType = {
    id?: true;
    name?: true;
    slug?: true;
    expectedNumberOfParticipants?: true;
    organisationId?: true;
    computeRealTimeStats?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type PollCountAggregateInputType = {
    id?: true;
    name?: true;
    slug?: true;
    funFacts?: true;
    computedResults?: true;
    expectedNumberOfParticipants?: true;
    customAdditionalQuestions?: true;
    organisationId?: true;
    computeRealTimeStats?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type PollAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Poll to aggregate.
     */
    where?: Prisma.PollWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Polls to fetch.
     */
    orderBy?: Prisma.PollOrderByWithRelationInput | Prisma.PollOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.PollWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Polls from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Polls.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Polls
    **/
    _count?: true | PollCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: PollAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: PollSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: PollMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: PollMaxAggregateInputType;
};
export type GetPollAggregateType<T extends PollAggregateArgs> = {
    [P in keyof T & keyof AggregatePoll]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePoll[P]> : Prisma.GetScalarType<T[P], AggregatePoll[P]>;
};
export type PollGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PollWhereInput;
    orderBy?: Prisma.PollOrderByWithAggregationInput | Prisma.PollOrderByWithAggregationInput[];
    by: Prisma.PollScalarFieldEnum[] | Prisma.PollScalarFieldEnum;
    having?: Prisma.PollScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PollCountAggregateInputType | true;
    _avg?: PollAvgAggregateInputType;
    _sum?: PollSumAggregateInputType;
    _min?: PollMinAggregateInputType;
    _max?: PollMaxAggregateInputType;
};
export type PollGroupByOutputType = {
    id: string;
    name: string;
    slug: string;
    funFacts: runtime.JsonValue | null;
    computedResults: runtime.JsonValue | null;
    expectedNumberOfParticipants: number | null;
    customAdditionalQuestions: runtime.JsonValue;
    organisationId: string;
    computeRealTimeStats: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: PollCountAggregateOutputType | null;
    _avg: PollAvgAggregateOutputType | null;
    _sum: PollSumAggregateOutputType | null;
    _min: PollMinAggregateOutputType | null;
    _max: PollMaxAggregateOutputType | null;
};
export type GetPollGroupByPayload<T extends PollGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PollGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PollGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PollGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PollGroupByOutputType[P]>;
}>>;
export type PollWhereInput = {
    AND?: Prisma.PollWhereInput | Prisma.PollWhereInput[];
    OR?: Prisma.PollWhereInput[];
    NOT?: Prisma.PollWhereInput | Prisma.PollWhereInput[];
    id?: Prisma.StringFilter<"Poll"> | string;
    name?: Prisma.StringFilter<"Poll"> | string;
    slug?: Prisma.StringFilter<"Poll"> | string;
    funFacts?: Prisma.JsonNullableFilter<"Poll">;
    computedResults?: Prisma.JsonNullableFilter<"Poll">;
    expectedNumberOfParticipants?: Prisma.IntNullableFilter<"Poll"> | number | null;
    customAdditionalQuestions?: Prisma.JsonFilter<"Poll">;
    organisationId?: Prisma.StringFilter<"Poll"> | string;
    computeRealTimeStats?: Prisma.BoolFilter<"Poll"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Poll"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Poll"> | Date | string;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionListRelationFilter;
    organisation?: Prisma.XOR<Prisma.OrganisationScalarRelationFilter, Prisma.OrganisationWhereInput>;
    simulations?: Prisma.SimulationPollListRelationFilter;
};
export type PollOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    funFacts?: Prisma.SortOrderInput | Prisma.SortOrder;
    computedResults?: Prisma.SortOrderInput | Prisma.SortOrder;
    expectedNumberOfParticipants?: Prisma.SortOrderInput | Prisma.SortOrder;
    customAdditionalQuestions?: Prisma.SortOrder;
    organisationId?: Prisma.SortOrder;
    computeRealTimeStats?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionOrderByRelationAggregateInput;
    organisation?: Prisma.OrganisationOrderByWithRelationInput;
    simulations?: Prisma.SimulationPollOrderByRelationAggregateInput;
};
export type PollWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    slug?: string;
    AND?: Prisma.PollWhereInput | Prisma.PollWhereInput[];
    OR?: Prisma.PollWhereInput[];
    NOT?: Prisma.PollWhereInput | Prisma.PollWhereInput[];
    name?: Prisma.StringFilter<"Poll"> | string;
    funFacts?: Prisma.JsonNullableFilter<"Poll">;
    computedResults?: Prisma.JsonNullableFilter<"Poll">;
    expectedNumberOfParticipants?: Prisma.IntNullableFilter<"Poll"> | number | null;
    customAdditionalQuestions?: Prisma.JsonFilter<"Poll">;
    organisationId?: Prisma.StringFilter<"Poll"> | string;
    computeRealTimeStats?: Prisma.BoolFilter<"Poll"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Poll"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Poll"> | Date | string;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionListRelationFilter;
    organisation?: Prisma.XOR<Prisma.OrganisationScalarRelationFilter, Prisma.OrganisationWhereInput>;
    simulations?: Prisma.SimulationPollListRelationFilter;
}, "id" | "slug">;
export type PollOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    funFacts?: Prisma.SortOrderInput | Prisma.SortOrder;
    computedResults?: Prisma.SortOrderInput | Prisma.SortOrder;
    expectedNumberOfParticipants?: Prisma.SortOrderInput | Prisma.SortOrder;
    customAdditionalQuestions?: Prisma.SortOrder;
    organisationId?: Prisma.SortOrder;
    computeRealTimeStats?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.PollCountOrderByAggregateInput;
    _avg?: Prisma.PollAvgOrderByAggregateInput;
    _max?: Prisma.PollMaxOrderByAggregateInput;
    _min?: Prisma.PollMinOrderByAggregateInput;
    _sum?: Prisma.PollSumOrderByAggregateInput;
};
export type PollScalarWhereWithAggregatesInput = {
    AND?: Prisma.PollScalarWhereWithAggregatesInput | Prisma.PollScalarWhereWithAggregatesInput[];
    OR?: Prisma.PollScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PollScalarWhereWithAggregatesInput | Prisma.PollScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Poll"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Poll"> | string;
    slug?: Prisma.StringWithAggregatesFilter<"Poll"> | string;
    funFacts?: Prisma.JsonNullableWithAggregatesFilter<"Poll">;
    computedResults?: Prisma.JsonNullableWithAggregatesFilter<"Poll">;
    expectedNumberOfParticipants?: Prisma.IntNullableWithAggregatesFilter<"Poll"> | number | null;
    customAdditionalQuestions?: Prisma.JsonWithAggregatesFilter<"Poll">;
    organisationId?: Prisma.StringWithAggregatesFilter<"Poll"> | string;
    computeRealTimeStats?: Prisma.BoolWithAggregatesFilter<"Poll"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Poll"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Poll"> | Date | string;
};
export type PollCreateInput = {
    id?: string;
    name: string;
    slug: string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: number | null;
    customAdditionalQuestions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    computeRealTimeStats?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionCreateNestedManyWithoutPollInput;
    organisation: Prisma.OrganisationCreateNestedOneWithoutPollsInput;
    simulations?: Prisma.SimulationPollCreateNestedManyWithoutPollInput;
};
export type PollUncheckedCreateInput = {
    id?: string;
    name: string;
    slug: string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: number | null;
    customAdditionalQuestions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    organisationId: string;
    computeRealTimeStats?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionUncheckedCreateNestedManyWithoutPollInput;
    simulations?: Prisma.SimulationPollUncheckedCreateNestedManyWithoutPollInput;
};
export type PollUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    customAdditionalQuestions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    computeRealTimeStats?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionUpdateManyWithoutPollNestedInput;
    organisation?: Prisma.OrganisationUpdateOneRequiredWithoutPollsNestedInput;
    simulations?: Prisma.SimulationPollUpdateManyWithoutPollNestedInput;
};
export type PollUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    customAdditionalQuestions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    organisationId?: Prisma.StringFieldUpdateOperationsInput | string;
    computeRealTimeStats?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionUncheckedUpdateManyWithoutPollNestedInput;
    simulations?: Prisma.SimulationPollUncheckedUpdateManyWithoutPollNestedInput;
};
export type PollCreateManyInput = {
    id?: string;
    name: string;
    slug: string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: number | null;
    customAdditionalQuestions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    organisationId: string;
    computeRealTimeStats?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PollUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    customAdditionalQuestions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    computeRealTimeStats?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PollUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    customAdditionalQuestions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    organisationId?: Prisma.StringFieldUpdateOperationsInput | string;
    computeRealTimeStats?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PollListRelationFilter = {
    every?: Prisma.PollWhereInput;
    some?: Prisma.PollWhereInput;
    none?: Prisma.PollWhereInput;
};
export type PollOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type PollCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    funFacts?: Prisma.SortOrder;
    computedResults?: Prisma.SortOrder;
    expectedNumberOfParticipants?: Prisma.SortOrder;
    customAdditionalQuestions?: Prisma.SortOrder;
    organisationId?: Prisma.SortOrder;
    computeRealTimeStats?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PollAvgOrderByAggregateInput = {
    expectedNumberOfParticipants?: Prisma.SortOrder;
};
export type PollMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    expectedNumberOfParticipants?: Prisma.SortOrder;
    organisationId?: Prisma.SortOrder;
    computeRealTimeStats?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PollMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    expectedNumberOfParticipants?: Prisma.SortOrder;
    organisationId?: Prisma.SortOrder;
    computeRealTimeStats?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PollSumOrderByAggregateInput = {
    expectedNumberOfParticipants?: Prisma.SortOrder;
};
export type PollScalarRelationFilter = {
    is?: Prisma.PollWhereInput;
    isNot?: Prisma.PollWhereInput;
};
export type PollCreateNestedManyWithoutOrganisationInput = {
    create?: Prisma.XOR<Prisma.PollCreateWithoutOrganisationInput, Prisma.PollUncheckedCreateWithoutOrganisationInput> | Prisma.PollCreateWithoutOrganisationInput[] | Prisma.PollUncheckedCreateWithoutOrganisationInput[];
    connectOrCreate?: Prisma.PollCreateOrConnectWithoutOrganisationInput | Prisma.PollCreateOrConnectWithoutOrganisationInput[];
    createMany?: Prisma.PollCreateManyOrganisationInputEnvelope;
    connect?: Prisma.PollWhereUniqueInput | Prisma.PollWhereUniqueInput[];
};
export type PollUncheckedCreateNestedManyWithoutOrganisationInput = {
    create?: Prisma.XOR<Prisma.PollCreateWithoutOrganisationInput, Prisma.PollUncheckedCreateWithoutOrganisationInput> | Prisma.PollCreateWithoutOrganisationInput[] | Prisma.PollUncheckedCreateWithoutOrganisationInput[];
    connectOrCreate?: Prisma.PollCreateOrConnectWithoutOrganisationInput | Prisma.PollCreateOrConnectWithoutOrganisationInput[];
    createMany?: Prisma.PollCreateManyOrganisationInputEnvelope;
    connect?: Prisma.PollWhereUniqueInput | Prisma.PollWhereUniqueInput[];
};
export type PollUpdateManyWithoutOrganisationNestedInput = {
    create?: Prisma.XOR<Prisma.PollCreateWithoutOrganisationInput, Prisma.PollUncheckedCreateWithoutOrganisationInput> | Prisma.PollCreateWithoutOrganisationInput[] | Prisma.PollUncheckedCreateWithoutOrganisationInput[];
    connectOrCreate?: Prisma.PollCreateOrConnectWithoutOrganisationInput | Prisma.PollCreateOrConnectWithoutOrganisationInput[];
    upsert?: Prisma.PollUpsertWithWhereUniqueWithoutOrganisationInput | Prisma.PollUpsertWithWhereUniqueWithoutOrganisationInput[];
    createMany?: Prisma.PollCreateManyOrganisationInputEnvelope;
    set?: Prisma.PollWhereUniqueInput | Prisma.PollWhereUniqueInput[];
    disconnect?: Prisma.PollWhereUniqueInput | Prisma.PollWhereUniqueInput[];
    delete?: Prisma.PollWhereUniqueInput | Prisma.PollWhereUniqueInput[];
    connect?: Prisma.PollWhereUniqueInput | Prisma.PollWhereUniqueInput[];
    update?: Prisma.PollUpdateWithWhereUniqueWithoutOrganisationInput | Prisma.PollUpdateWithWhereUniqueWithoutOrganisationInput[];
    updateMany?: Prisma.PollUpdateManyWithWhereWithoutOrganisationInput | Prisma.PollUpdateManyWithWhereWithoutOrganisationInput[];
    deleteMany?: Prisma.PollScalarWhereInput | Prisma.PollScalarWhereInput[];
};
export type PollUncheckedUpdateManyWithoutOrganisationNestedInput = {
    create?: Prisma.XOR<Prisma.PollCreateWithoutOrganisationInput, Prisma.PollUncheckedCreateWithoutOrganisationInput> | Prisma.PollCreateWithoutOrganisationInput[] | Prisma.PollUncheckedCreateWithoutOrganisationInput[];
    connectOrCreate?: Prisma.PollCreateOrConnectWithoutOrganisationInput | Prisma.PollCreateOrConnectWithoutOrganisationInput[];
    upsert?: Prisma.PollUpsertWithWhereUniqueWithoutOrganisationInput | Prisma.PollUpsertWithWhereUniqueWithoutOrganisationInput[];
    createMany?: Prisma.PollCreateManyOrganisationInputEnvelope;
    set?: Prisma.PollWhereUniqueInput | Prisma.PollWhereUniqueInput[];
    disconnect?: Prisma.PollWhereUniqueInput | Prisma.PollWhereUniqueInput[];
    delete?: Prisma.PollWhereUniqueInput | Prisma.PollWhereUniqueInput[];
    connect?: Prisma.PollWhereUniqueInput | Prisma.PollWhereUniqueInput[];
    update?: Prisma.PollUpdateWithWhereUniqueWithoutOrganisationInput | Prisma.PollUpdateWithWhereUniqueWithoutOrganisationInput[];
    updateMany?: Prisma.PollUpdateManyWithWhereWithoutOrganisationInput | Prisma.PollUpdateManyWithWhereWithoutOrganisationInput[];
    deleteMany?: Prisma.PollScalarWhereInput | Prisma.PollScalarWhereInput[];
};
export type PollCreateNestedOneWithoutDefaultAdditionalQuestionsInput = {
    create?: Prisma.XOR<Prisma.PollCreateWithoutDefaultAdditionalQuestionsInput, Prisma.PollUncheckedCreateWithoutDefaultAdditionalQuestionsInput>;
    connectOrCreate?: Prisma.PollCreateOrConnectWithoutDefaultAdditionalQuestionsInput;
    connect?: Prisma.PollWhereUniqueInput;
};
export type PollUpdateOneRequiredWithoutDefaultAdditionalQuestionsNestedInput = {
    create?: Prisma.XOR<Prisma.PollCreateWithoutDefaultAdditionalQuestionsInput, Prisma.PollUncheckedCreateWithoutDefaultAdditionalQuestionsInput>;
    connectOrCreate?: Prisma.PollCreateOrConnectWithoutDefaultAdditionalQuestionsInput;
    upsert?: Prisma.PollUpsertWithoutDefaultAdditionalQuestionsInput;
    connect?: Prisma.PollWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PollUpdateToOneWithWhereWithoutDefaultAdditionalQuestionsInput, Prisma.PollUpdateWithoutDefaultAdditionalQuestionsInput>, Prisma.PollUncheckedUpdateWithoutDefaultAdditionalQuestionsInput>;
};
export type PollCreateNestedOneWithoutSimulationsInput = {
    create?: Prisma.XOR<Prisma.PollCreateWithoutSimulationsInput, Prisma.PollUncheckedCreateWithoutSimulationsInput>;
    connectOrCreate?: Prisma.PollCreateOrConnectWithoutSimulationsInput;
    connect?: Prisma.PollWhereUniqueInput;
};
export type PollUpdateOneRequiredWithoutSimulationsNestedInput = {
    create?: Prisma.XOR<Prisma.PollCreateWithoutSimulationsInput, Prisma.PollUncheckedCreateWithoutSimulationsInput>;
    connectOrCreate?: Prisma.PollCreateOrConnectWithoutSimulationsInput;
    upsert?: Prisma.PollUpsertWithoutSimulationsInput;
    connect?: Prisma.PollWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PollUpdateToOneWithWhereWithoutSimulationsInput, Prisma.PollUpdateWithoutSimulationsInput>, Prisma.PollUncheckedUpdateWithoutSimulationsInput>;
};
export type PollCreateWithoutOrganisationInput = {
    id?: string;
    name: string;
    slug: string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: number | null;
    customAdditionalQuestions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    computeRealTimeStats?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionCreateNestedManyWithoutPollInput;
    simulations?: Prisma.SimulationPollCreateNestedManyWithoutPollInput;
};
export type PollUncheckedCreateWithoutOrganisationInput = {
    id?: string;
    name: string;
    slug: string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: number | null;
    customAdditionalQuestions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    computeRealTimeStats?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionUncheckedCreateNestedManyWithoutPollInput;
    simulations?: Prisma.SimulationPollUncheckedCreateNestedManyWithoutPollInput;
};
export type PollCreateOrConnectWithoutOrganisationInput = {
    where: Prisma.PollWhereUniqueInput;
    create: Prisma.XOR<Prisma.PollCreateWithoutOrganisationInput, Prisma.PollUncheckedCreateWithoutOrganisationInput>;
};
export type PollCreateManyOrganisationInputEnvelope = {
    data: Prisma.PollCreateManyOrganisationInput | Prisma.PollCreateManyOrganisationInput[];
    skipDuplicates?: boolean;
};
export type PollUpsertWithWhereUniqueWithoutOrganisationInput = {
    where: Prisma.PollWhereUniqueInput;
    update: Prisma.XOR<Prisma.PollUpdateWithoutOrganisationInput, Prisma.PollUncheckedUpdateWithoutOrganisationInput>;
    create: Prisma.XOR<Prisma.PollCreateWithoutOrganisationInput, Prisma.PollUncheckedCreateWithoutOrganisationInput>;
};
export type PollUpdateWithWhereUniqueWithoutOrganisationInput = {
    where: Prisma.PollWhereUniqueInput;
    data: Prisma.XOR<Prisma.PollUpdateWithoutOrganisationInput, Prisma.PollUncheckedUpdateWithoutOrganisationInput>;
};
export type PollUpdateManyWithWhereWithoutOrganisationInput = {
    where: Prisma.PollScalarWhereInput;
    data: Prisma.XOR<Prisma.PollUpdateManyMutationInput, Prisma.PollUncheckedUpdateManyWithoutOrganisationInput>;
};
export type PollScalarWhereInput = {
    AND?: Prisma.PollScalarWhereInput | Prisma.PollScalarWhereInput[];
    OR?: Prisma.PollScalarWhereInput[];
    NOT?: Prisma.PollScalarWhereInput | Prisma.PollScalarWhereInput[];
    id?: Prisma.StringFilter<"Poll"> | string;
    name?: Prisma.StringFilter<"Poll"> | string;
    slug?: Prisma.StringFilter<"Poll"> | string;
    funFacts?: Prisma.JsonNullableFilter<"Poll">;
    computedResults?: Prisma.JsonNullableFilter<"Poll">;
    expectedNumberOfParticipants?: Prisma.IntNullableFilter<"Poll"> | number | null;
    customAdditionalQuestions?: Prisma.JsonFilter<"Poll">;
    organisationId?: Prisma.StringFilter<"Poll"> | string;
    computeRealTimeStats?: Prisma.BoolFilter<"Poll"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Poll"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Poll"> | Date | string;
};
export type PollCreateWithoutDefaultAdditionalQuestionsInput = {
    id?: string;
    name: string;
    slug: string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: number | null;
    customAdditionalQuestions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    computeRealTimeStats?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    organisation: Prisma.OrganisationCreateNestedOneWithoutPollsInput;
    simulations?: Prisma.SimulationPollCreateNestedManyWithoutPollInput;
};
export type PollUncheckedCreateWithoutDefaultAdditionalQuestionsInput = {
    id?: string;
    name: string;
    slug: string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: number | null;
    customAdditionalQuestions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    organisationId: string;
    computeRealTimeStats?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    simulations?: Prisma.SimulationPollUncheckedCreateNestedManyWithoutPollInput;
};
export type PollCreateOrConnectWithoutDefaultAdditionalQuestionsInput = {
    where: Prisma.PollWhereUniqueInput;
    create: Prisma.XOR<Prisma.PollCreateWithoutDefaultAdditionalQuestionsInput, Prisma.PollUncheckedCreateWithoutDefaultAdditionalQuestionsInput>;
};
export type PollUpsertWithoutDefaultAdditionalQuestionsInput = {
    update: Prisma.XOR<Prisma.PollUpdateWithoutDefaultAdditionalQuestionsInput, Prisma.PollUncheckedUpdateWithoutDefaultAdditionalQuestionsInput>;
    create: Prisma.XOR<Prisma.PollCreateWithoutDefaultAdditionalQuestionsInput, Prisma.PollUncheckedCreateWithoutDefaultAdditionalQuestionsInput>;
    where?: Prisma.PollWhereInput;
};
export type PollUpdateToOneWithWhereWithoutDefaultAdditionalQuestionsInput = {
    where?: Prisma.PollWhereInput;
    data: Prisma.XOR<Prisma.PollUpdateWithoutDefaultAdditionalQuestionsInput, Prisma.PollUncheckedUpdateWithoutDefaultAdditionalQuestionsInput>;
};
export type PollUpdateWithoutDefaultAdditionalQuestionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    customAdditionalQuestions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    computeRealTimeStats?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    organisation?: Prisma.OrganisationUpdateOneRequiredWithoutPollsNestedInput;
    simulations?: Prisma.SimulationPollUpdateManyWithoutPollNestedInput;
};
export type PollUncheckedUpdateWithoutDefaultAdditionalQuestionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    customAdditionalQuestions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    organisationId?: Prisma.StringFieldUpdateOperationsInput | string;
    computeRealTimeStats?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    simulations?: Prisma.SimulationPollUncheckedUpdateManyWithoutPollNestedInput;
};
export type PollCreateWithoutSimulationsInput = {
    id?: string;
    name: string;
    slug: string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: number | null;
    customAdditionalQuestions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    computeRealTimeStats?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionCreateNestedManyWithoutPollInput;
    organisation: Prisma.OrganisationCreateNestedOneWithoutPollsInput;
};
export type PollUncheckedCreateWithoutSimulationsInput = {
    id?: string;
    name: string;
    slug: string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: number | null;
    customAdditionalQuestions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    organisationId: string;
    computeRealTimeStats?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionUncheckedCreateNestedManyWithoutPollInput;
};
export type PollCreateOrConnectWithoutSimulationsInput = {
    where: Prisma.PollWhereUniqueInput;
    create: Prisma.XOR<Prisma.PollCreateWithoutSimulationsInput, Prisma.PollUncheckedCreateWithoutSimulationsInput>;
};
export type PollUpsertWithoutSimulationsInput = {
    update: Prisma.XOR<Prisma.PollUpdateWithoutSimulationsInput, Prisma.PollUncheckedUpdateWithoutSimulationsInput>;
    create: Prisma.XOR<Prisma.PollCreateWithoutSimulationsInput, Prisma.PollUncheckedCreateWithoutSimulationsInput>;
    where?: Prisma.PollWhereInput;
};
export type PollUpdateToOneWithWhereWithoutSimulationsInput = {
    where?: Prisma.PollWhereInput;
    data: Prisma.XOR<Prisma.PollUpdateWithoutSimulationsInput, Prisma.PollUncheckedUpdateWithoutSimulationsInput>;
};
export type PollUpdateWithoutSimulationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    customAdditionalQuestions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    computeRealTimeStats?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionUpdateManyWithoutPollNestedInput;
    organisation?: Prisma.OrganisationUpdateOneRequiredWithoutPollsNestedInput;
};
export type PollUncheckedUpdateWithoutSimulationsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    customAdditionalQuestions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    organisationId?: Prisma.StringFieldUpdateOperationsInput | string;
    computeRealTimeStats?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionUncheckedUpdateManyWithoutPollNestedInput;
};
export type PollCreateManyOrganisationInput = {
    id?: string;
    name: string;
    slug: string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: number | null;
    customAdditionalQuestions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    computeRealTimeStats?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PollUpdateWithoutOrganisationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    customAdditionalQuestions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    computeRealTimeStats?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionUpdateManyWithoutPollNestedInput;
    simulations?: Prisma.SimulationPollUpdateManyWithoutPollNestedInput;
};
export type PollUncheckedUpdateWithoutOrganisationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    customAdditionalQuestions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    computeRealTimeStats?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    defaultAdditionalQuestions?: Prisma.PollDefaultAdditionalQuestionUncheckedUpdateManyWithoutPollNestedInput;
    simulations?: Prisma.SimulationPollUncheckedUpdateManyWithoutPollNestedInput;
};
export type PollUncheckedUpdateManyWithoutOrganisationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    slug?: Prisma.StringFieldUpdateOperationsInput | string;
    funFacts?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    computedResults?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    expectedNumberOfParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    customAdditionalQuestions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    computeRealTimeStats?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type PollCountOutputType
 */
export type PollCountOutputType = {
    defaultAdditionalQuestions: number;
    simulations: number;
};
export type PollCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    defaultAdditionalQuestions?: boolean | PollCountOutputTypeCountDefaultAdditionalQuestionsArgs;
    simulations?: boolean | PollCountOutputTypeCountSimulationsArgs;
};
/**
 * PollCountOutputType without action
 */
export type PollCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollCountOutputType
     */
    select?: Prisma.PollCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * PollCountOutputType without action
 */
export type PollCountOutputTypeCountDefaultAdditionalQuestionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PollDefaultAdditionalQuestionWhereInput;
};
/**
 * PollCountOutputType without action
 */
export type PollCountOutputTypeCountSimulationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SimulationPollWhereInput;
};
export type PollSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    slug?: boolean;
    funFacts?: boolean;
    computedResults?: boolean;
    expectedNumberOfParticipants?: boolean;
    customAdditionalQuestions?: boolean;
    organisationId?: boolean;
    computeRealTimeStats?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    defaultAdditionalQuestions?: boolean | Prisma.Poll$defaultAdditionalQuestionsArgs<ExtArgs>;
    organisation?: boolean | Prisma.OrganisationDefaultArgs<ExtArgs>;
    simulations?: boolean | Prisma.Poll$simulationsArgs<ExtArgs>;
    _count?: boolean | Prisma.PollCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["poll"]>;
export type PollSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    slug?: boolean;
    funFacts?: boolean;
    computedResults?: boolean;
    expectedNumberOfParticipants?: boolean;
    customAdditionalQuestions?: boolean;
    organisationId?: boolean;
    computeRealTimeStats?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    organisation?: boolean | Prisma.OrganisationDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["poll"]>;
export type PollSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    slug?: boolean;
    funFacts?: boolean;
    computedResults?: boolean;
    expectedNumberOfParticipants?: boolean;
    customAdditionalQuestions?: boolean;
    organisationId?: boolean;
    computeRealTimeStats?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    organisation?: boolean | Prisma.OrganisationDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["poll"]>;
export type PollSelectScalar = {
    id?: boolean;
    name?: boolean;
    slug?: boolean;
    funFacts?: boolean;
    computedResults?: boolean;
    expectedNumberOfParticipants?: boolean;
    customAdditionalQuestions?: boolean;
    organisationId?: boolean;
    computeRealTimeStats?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type PollOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "slug" | "funFacts" | "computedResults" | "expectedNumberOfParticipants" | "customAdditionalQuestions" | "organisationId" | "computeRealTimeStats" | "createdAt" | "updatedAt", ExtArgs["result"]["poll"]>;
export type PollInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    defaultAdditionalQuestions?: boolean | Prisma.Poll$defaultAdditionalQuestionsArgs<ExtArgs>;
    organisation?: boolean | Prisma.OrganisationDefaultArgs<ExtArgs>;
    simulations?: boolean | Prisma.Poll$simulationsArgs<ExtArgs>;
    _count?: boolean | Prisma.PollCountOutputTypeDefaultArgs<ExtArgs>;
};
export type PollIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    organisation?: boolean | Prisma.OrganisationDefaultArgs<ExtArgs>;
};
export type PollIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    organisation?: boolean | Prisma.OrganisationDefaultArgs<ExtArgs>;
};
export type $PollPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Poll";
    objects: {
        defaultAdditionalQuestions: Prisma.$PollDefaultAdditionalQuestionPayload<ExtArgs>[];
        organisation: Prisma.$OrganisationPayload<ExtArgs>;
        simulations: Prisma.$SimulationPollPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        slug: string;
        funFacts: runtime.JsonValue | null;
        computedResults: runtime.JsonValue | null;
        expectedNumberOfParticipants: number | null;
        customAdditionalQuestions: runtime.JsonValue;
        organisationId: string;
        computeRealTimeStats: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["poll"]>;
    composites: {};
};
export type PollGetPayload<S extends boolean | null | undefined | PollDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PollPayload, S>;
export type PollCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PollFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PollCountAggregateInputType | true;
};
export interface PollDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Poll'];
        meta: {
            name: 'Poll';
        };
    };
    /**
     * Find zero or one Poll that matches the filter.
     * @param {PollFindUniqueArgs} args - Arguments to find a Poll
     * @example
     * // Get one Poll
     * const poll = await prisma.poll.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PollFindUniqueArgs>(args: Prisma.SelectSubset<T, PollFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PollClient<runtime.Types.Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Poll that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PollFindUniqueOrThrowArgs} args - Arguments to find a Poll
     * @example
     * // Get one Poll
     * const poll = await prisma.poll.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PollFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PollFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PollClient<runtime.Types.Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Poll that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollFindFirstArgs} args - Arguments to find a Poll
     * @example
     * // Get one Poll
     * const poll = await prisma.poll.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PollFindFirstArgs>(args?: Prisma.SelectSubset<T, PollFindFirstArgs<ExtArgs>>): Prisma.Prisma__PollClient<runtime.Types.Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Poll that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollFindFirstOrThrowArgs} args - Arguments to find a Poll
     * @example
     * // Get one Poll
     * const poll = await prisma.poll.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PollFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PollFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PollClient<runtime.Types.Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Polls that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Polls
     * const polls = await prisma.poll.findMany()
     *
     * // Get first 10 Polls
     * const polls = await prisma.poll.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const pollWithIdOnly = await prisma.poll.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PollFindManyArgs>(args?: Prisma.SelectSubset<T, PollFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Poll.
     * @param {PollCreateArgs} args - Arguments to create a Poll.
     * @example
     * // Create one Poll
     * const Poll = await prisma.poll.create({
     *   data: {
     *     // ... data to create a Poll
     *   }
     * })
     *
     */
    create<T extends PollCreateArgs>(args: Prisma.SelectSubset<T, PollCreateArgs<ExtArgs>>): Prisma.Prisma__PollClient<runtime.Types.Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Polls.
     * @param {PollCreateManyArgs} args - Arguments to create many Polls.
     * @example
     * // Create many Polls
     * const poll = await prisma.poll.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PollCreateManyArgs>(args?: Prisma.SelectSubset<T, PollCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Polls and returns the data saved in the database.
     * @param {PollCreateManyAndReturnArgs} args - Arguments to create many Polls.
     * @example
     * // Create many Polls
     * const poll = await prisma.poll.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Polls and only return the `id`
     * const pollWithIdOnly = await prisma.poll.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PollCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PollCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Poll.
     * @param {PollDeleteArgs} args - Arguments to delete one Poll.
     * @example
     * // Delete one Poll
     * const Poll = await prisma.poll.delete({
     *   where: {
     *     // ... filter to delete one Poll
     *   }
     * })
     *
     */
    delete<T extends PollDeleteArgs>(args: Prisma.SelectSubset<T, PollDeleteArgs<ExtArgs>>): Prisma.Prisma__PollClient<runtime.Types.Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Poll.
     * @param {PollUpdateArgs} args - Arguments to update one Poll.
     * @example
     * // Update one Poll
     * const poll = await prisma.poll.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PollUpdateArgs>(args: Prisma.SelectSubset<T, PollUpdateArgs<ExtArgs>>): Prisma.Prisma__PollClient<runtime.Types.Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Polls.
     * @param {PollDeleteManyArgs} args - Arguments to filter Polls to delete.
     * @example
     * // Delete a few Polls
     * const { count } = await prisma.poll.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PollDeleteManyArgs>(args?: Prisma.SelectSubset<T, PollDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Polls.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Polls
     * const poll = await prisma.poll.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PollUpdateManyArgs>(args: Prisma.SelectSubset<T, PollUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Polls and returns the data updated in the database.
     * @param {PollUpdateManyAndReturnArgs} args - Arguments to update many Polls.
     * @example
     * // Update many Polls
     * const poll = await prisma.poll.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Polls and only return the `id`
     * const pollWithIdOnly = await prisma.poll.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends PollUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PollUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Poll.
     * @param {PollUpsertArgs} args - Arguments to update or create a Poll.
     * @example
     * // Update or create a Poll
     * const poll = await prisma.poll.upsert({
     *   create: {
     *     // ... data to create a Poll
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Poll we want to update
     *   }
     * })
     */
    upsert<T extends PollUpsertArgs>(args: Prisma.SelectSubset<T, PollUpsertArgs<ExtArgs>>): Prisma.Prisma__PollClient<runtime.Types.Result.GetResult<Prisma.$PollPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Polls.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollCountArgs} args - Arguments to filter Polls to count.
     * @example
     * // Count the number of Polls
     * const count = await prisma.poll.count({
     *   where: {
     *     // ... the filter for the Polls we want to count
     *   }
     * })
    **/
    count<T extends PollCountArgs>(args?: Prisma.Subset<T, PollCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PollCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Poll.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PollAggregateArgs>(args: Prisma.Subset<T, PollAggregateArgs>): Prisma.PrismaPromise<GetPollAggregateType<T>>;
    /**
     * Group by Poll.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PollGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends PollGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PollGroupByArgs['orderBy'];
    } : {
        orderBy?: PollGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PollGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPollGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Poll model
     */
    readonly fields: PollFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Poll.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__PollClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    defaultAdditionalQuestions<T extends Prisma.Poll$defaultAdditionalQuestionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Poll$defaultAdditionalQuestionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PollDefaultAdditionalQuestionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    organisation<T extends Prisma.OrganisationDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OrganisationDefaultArgs<ExtArgs>>): Prisma.Prisma__OrganisationClient<runtime.Types.Result.GetResult<Prisma.$OrganisationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    simulations<T extends Prisma.Poll$simulationsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Poll$simulationsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SimulationPollPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the Poll model
 */
export interface PollFieldRefs {
    readonly id: Prisma.FieldRef<"Poll", 'String'>;
    readonly name: Prisma.FieldRef<"Poll", 'String'>;
    readonly slug: Prisma.FieldRef<"Poll", 'String'>;
    readonly funFacts: Prisma.FieldRef<"Poll", 'Json'>;
    readonly computedResults: Prisma.FieldRef<"Poll", 'Json'>;
    readonly expectedNumberOfParticipants: Prisma.FieldRef<"Poll", 'Int'>;
    readonly customAdditionalQuestions: Prisma.FieldRef<"Poll", 'Json'>;
    readonly organisationId: Prisma.FieldRef<"Poll", 'String'>;
    readonly computeRealTimeStats: Prisma.FieldRef<"Poll", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"Poll", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Poll", 'DateTime'>;
}
/**
 * Poll findUnique
 */
export type PollFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: Prisma.PollSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Poll
     */
    omit?: Prisma.PollOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PollInclude<ExtArgs> | null;
    /**
     * Filter, which Poll to fetch.
     */
    where: Prisma.PollWhereUniqueInput;
};
/**
 * Poll findUniqueOrThrow
 */
export type PollFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: Prisma.PollSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Poll
     */
    omit?: Prisma.PollOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PollInclude<ExtArgs> | null;
    /**
     * Filter, which Poll to fetch.
     */
    where: Prisma.PollWhereUniqueInput;
};
/**
 * Poll findFirst
 */
export type PollFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: Prisma.PollSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Poll
     */
    omit?: Prisma.PollOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PollInclude<ExtArgs> | null;
    /**
     * Filter, which Poll to fetch.
     */
    where?: Prisma.PollWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Polls to fetch.
     */
    orderBy?: Prisma.PollOrderByWithRelationInput | Prisma.PollOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Polls.
     */
    cursor?: Prisma.PollWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Polls from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Polls.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Polls.
     */
    distinct?: Prisma.PollScalarFieldEnum | Prisma.PollScalarFieldEnum[];
};
/**
 * Poll findFirstOrThrow
 */
export type PollFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: Prisma.PollSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Poll
     */
    omit?: Prisma.PollOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PollInclude<ExtArgs> | null;
    /**
     * Filter, which Poll to fetch.
     */
    where?: Prisma.PollWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Polls to fetch.
     */
    orderBy?: Prisma.PollOrderByWithRelationInput | Prisma.PollOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Polls.
     */
    cursor?: Prisma.PollWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Polls from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Polls.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Polls.
     */
    distinct?: Prisma.PollScalarFieldEnum | Prisma.PollScalarFieldEnum[];
};
/**
 * Poll findMany
 */
export type PollFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: Prisma.PollSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Poll
     */
    omit?: Prisma.PollOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PollInclude<ExtArgs> | null;
    /**
     * Filter, which Polls to fetch.
     */
    where?: Prisma.PollWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Polls to fetch.
     */
    orderBy?: Prisma.PollOrderByWithRelationInput | Prisma.PollOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Polls.
     */
    cursor?: Prisma.PollWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Polls from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Polls.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Polls.
     */
    distinct?: Prisma.PollScalarFieldEnum | Prisma.PollScalarFieldEnum[];
};
/**
 * Poll create
 */
export type PollCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: Prisma.PollSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Poll
     */
    omit?: Prisma.PollOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PollInclude<ExtArgs> | null;
    /**
     * The data needed to create a Poll.
     */
    data: Prisma.XOR<Prisma.PollCreateInput, Prisma.PollUncheckedCreateInput>;
};
/**
 * Poll createMany
 */
export type PollCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Polls.
     */
    data: Prisma.PollCreateManyInput | Prisma.PollCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Poll createManyAndReturn
 */
export type PollCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: Prisma.PollSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Poll
     */
    omit?: Prisma.PollOmit<ExtArgs> | null;
    /**
     * The data used to create many Polls.
     */
    data: Prisma.PollCreateManyInput | Prisma.PollCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PollIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * Poll update
 */
export type PollUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: Prisma.PollSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Poll
     */
    omit?: Prisma.PollOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PollInclude<ExtArgs> | null;
    /**
     * The data needed to update a Poll.
     */
    data: Prisma.XOR<Prisma.PollUpdateInput, Prisma.PollUncheckedUpdateInput>;
    /**
     * Choose, which Poll to update.
     */
    where: Prisma.PollWhereUniqueInput;
};
/**
 * Poll updateMany
 */
export type PollUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Polls.
     */
    data: Prisma.XOR<Prisma.PollUpdateManyMutationInput, Prisma.PollUncheckedUpdateManyInput>;
    /**
     * Filter which Polls to update
     */
    where?: Prisma.PollWhereInput;
    /**
     * Limit how many Polls to update.
     */
    limit?: number;
};
/**
 * Poll updateManyAndReturn
 */
export type PollUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: Prisma.PollSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Poll
     */
    omit?: Prisma.PollOmit<ExtArgs> | null;
    /**
     * The data used to update Polls.
     */
    data: Prisma.XOR<Prisma.PollUpdateManyMutationInput, Prisma.PollUncheckedUpdateManyInput>;
    /**
     * Filter which Polls to update
     */
    where?: Prisma.PollWhereInput;
    /**
     * Limit how many Polls to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PollIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * Poll upsert
 */
export type PollUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: Prisma.PollSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Poll
     */
    omit?: Prisma.PollOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PollInclude<ExtArgs> | null;
    /**
     * The filter to search for the Poll to update in case it exists.
     */
    where: Prisma.PollWhereUniqueInput;
    /**
     * In case the Poll found by the `where` argument doesn't exist, create a new Poll with this data.
     */
    create: Prisma.XOR<Prisma.PollCreateInput, Prisma.PollUncheckedCreateInput>;
    /**
     * In case the Poll was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.PollUpdateInput, Prisma.PollUncheckedUpdateInput>;
};
/**
 * Poll delete
 */
export type PollDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: Prisma.PollSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Poll
     */
    omit?: Prisma.PollOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PollInclude<ExtArgs> | null;
    /**
     * Filter which Poll to delete.
     */
    where: Prisma.PollWhereUniqueInput;
};
/**
 * Poll deleteMany
 */
export type PollDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Polls to delete
     */
    where?: Prisma.PollWhereInput;
    /**
     * Limit how many Polls to delete.
     */
    limit?: number;
};
/**
 * Poll.defaultAdditionalQuestions
 */
export type Poll$defaultAdditionalQuestionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PollDefaultAdditionalQuestion
     */
    select?: Prisma.PollDefaultAdditionalQuestionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PollDefaultAdditionalQuestion
     */
    omit?: Prisma.PollDefaultAdditionalQuestionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PollDefaultAdditionalQuestionInclude<ExtArgs> | null;
    where?: Prisma.PollDefaultAdditionalQuestionWhereInput;
    orderBy?: Prisma.PollDefaultAdditionalQuestionOrderByWithRelationInput | Prisma.PollDefaultAdditionalQuestionOrderByWithRelationInput[];
    cursor?: Prisma.PollDefaultAdditionalQuestionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PollDefaultAdditionalQuestionScalarFieldEnum | Prisma.PollDefaultAdditionalQuestionScalarFieldEnum[];
};
/**
 * Poll.simulations
 */
export type Poll$simulationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationPoll
     */
    select?: Prisma.SimulationPollSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SimulationPoll
     */
    omit?: Prisma.SimulationPollOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationPollInclude<ExtArgs> | null;
    where?: Prisma.SimulationPollWhereInput;
    orderBy?: Prisma.SimulationPollOrderByWithRelationInput | Prisma.SimulationPollOrderByWithRelationInput[];
    cursor?: Prisma.SimulationPollWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SimulationPollScalarFieldEnum | Prisma.SimulationPollScalarFieldEnum[];
};
/**
 * Poll without action
 */
export type PollDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Poll
     */
    select?: Prisma.PollSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Poll
     */
    omit?: Prisma.PollOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PollInclude<ExtArgs> | null;
};
