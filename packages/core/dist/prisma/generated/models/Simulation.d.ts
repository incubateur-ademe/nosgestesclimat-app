import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.ts";
/**
 * Model Simulation
 *
 */
export type SimulationModel = runtime.Types.Result.DefaultSelection<Prisma.$SimulationPayload>;
export type AggregateSimulation = {
    _count: SimulationCountAggregateOutputType | null;
    _avg: SimulationAvgAggregateOutputType | null;
    _sum: SimulationSumAggregateOutputType | null;
    _min: SimulationMinAggregateOutputType | null;
    _max: SimulationMaxAggregateOutputType | null;
};
export type SimulationAvgAggregateOutputType = {
    progression: number | null;
};
export type SimulationSumAggregateOutputType = {
    progression: number | null;
};
export type SimulationMinAggregateOutputType = {
    id: string | null;
    date: Date | null;
    progression: number | null;
    model: string | null;
    userId: string | null;
    userEmail: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SimulationMaxAggregateOutputType = {
    id: string | null;
    date: Date | null;
    progression: number | null;
    model: string | null;
    userId: string | null;
    userEmail: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SimulationCountAggregateOutputType = {
    id: number;
    date: number;
    progression: number;
    model: number;
    computedResults: number;
    actionChoices: number;
    situation: number;
    extendedSituation: number;
    foldedSteps: number;
    userId: number;
    userEmail: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type SimulationAvgAggregateInputType = {
    progression?: true;
};
export type SimulationSumAggregateInputType = {
    progression?: true;
};
export type SimulationMinAggregateInputType = {
    id?: true;
    date?: true;
    progression?: true;
    model?: true;
    userId?: true;
    userEmail?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type SimulationMaxAggregateInputType = {
    id?: true;
    date?: true;
    progression?: true;
    model?: true;
    userId?: true;
    userEmail?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type SimulationCountAggregateInputType = {
    id?: true;
    date?: true;
    progression?: true;
    model?: true;
    computedResults?: true;
    actionChoices?: true;
    situation?: true;
    extendedSituation?: true;
    foldedSteps?: true;
    userId?: true;
    userEmail?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type SimulationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Simulation to aggregate.
     */
    where?: Prisma.SimulationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Simulations to fetch.
     */
    orderBy?: Prisma.SimulationOrderByWithRelationInput | Prisma.SimulationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.SimulationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Simulations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Simulations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Simulations
    **/
    _count?: true | SimulationCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: SimulationAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: SimulationSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: SimulationMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: SimulationMaxAggregateInputType;
};
export type GetSimulationAggregateType<T extends SimulationAggregateArgs> = {
    [P in keyof T & keyof AggregateSimulation]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSimulation[P]> : Prisma.GetScalarType<T[P], AggregateSimulation[P]>;
};
export type SimulationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SimulationWhereInput;
    orderBy?: Prisma.SimulationOrderByWithAggregationInput | Prisma.SimulationOrderByWithAggregationInput[];
    by: Prisma.SimulationScalarFieldEnum[] | Prisma.SimulationScalarFieldEnum;
    having?: Prisma.SimulationScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SimulationCountAggregateInputType | true;
    _avg?: SimulationAvgAggregateInputType;
    _sum?: SimulationSumAggregateInputType;
    _min?: SimulationMinAggregateInputType;
    _max?: SimulationMaxAggregateInputType;
};
export type SimulationGroupByOutputType = {
    id: string;
    date: Date;
    progression: number;
    model: string;
    computedResults: runtime.JsonValue;
    actionChoices: runtime.JsonValue;
    situation: runtime.JsonValue;
    extendedSituation: runtime.JsonValue | null;
    foldedSteps: runtime.JsonValue[];
    userId: string | null;
    userEmail: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: SimulationCountAggregateOutputType | null;
    _avg: SimulationAvgAggregateOutputType | null;
    _sum: SimulationSumAggregateOutputType | null;
    _min: SimulationMinAggregateOutputType | null;
    _max: SimulationMaxAggregateOutputType | null;
};
export type GetSimulationGroupByPayload<T extends SimulationGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SimulationGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SimulationGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SimulationGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SimulationGroupByOutputType[P]>;
}>>;
export type SimulationWhereInput = {
    AND?: Prisma.SimulationWhereInput | Prisma.SimulationWhereInput[];
    OR?: Prisma.SimulationWhereInput[];
    NOT?: Prisma.SimulationWhereInput | Prisma.SimulationWhereInput[];
    id?: Prisma.UuidFilter<"Simulation"> | string;
    date?: Prisma.DateTimeFilter<"Simulation"> | Date | string;
    progression?: Prisma.FloatFilter<"Simulation"> | number;
    model?: Prisma.StringFilter<"Simulation"> | string;
    computedResults?: Prisma.JsonFilter<"Simulation">;
    actionChoices?: Prisma.JsonFilter<"Simulation">;
    situation?: Prisma.JsonFilter<"Simulation">;
    extendedSituation?: Prisma.JsonNullableFilter<"Simulation">;
    foldedSteps?: Prisma.JsonNullableListFilter<"Simulation">;
    userId?: Prisma.UuidNullableFilter<"Simulation"> | string | null;
    userEmail?: Prisma.StringNullableFilter<"Simulation"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Simulation"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Simulation"> | Date | string;
    states?: Prisma.SimulationStateListRelationFilter;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerListRelationFilter;
    polls?: Prisma.SimulationPollListRelationFilter;
    groups?: Prisma.GroupParticipantListRelationFilter;
    user?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
    verifiedUser?: Prisma.XOR<Prisma.VerifiedUserNullableScalarRelationFilter, Prisma.VerifiedUserWhereInput> | null;
};
export type SimulationOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    computedResults?: Prisma.SortOrder;
    actionChoices?: Prisma.SortOrder;
    situation?: Prisma.SortOrder;
    extendedSituation?: Prisma.SortOrderInput | Prisma.SortOrder;
    foldedSteps?: Prisma.SortOrder;
    userId?: Prisma.SortOrderInput | Prisma.SortOrder;
    userEmail?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    states?: Prisma.SimulationStateOrderByRelationAggregateInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerOrderByRelationAggregateInput;
    polls?: Prisma.SimulationPollOrderByRelationAggregateInput;
    groups?: Prisma.GroupParticipantOrderByRelationAggregateInput;
    user?: Prisma.UserOrderByWithRelationInput;
    verifiedUser?: Prisma.VerifiedUserOrderByWithRelationInput;
};
export type SimulationWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.SimulationWhereInput | Prisma.SimulationWhereInput[];
    OR?: Prisma.SimulationWhereInput[];
    NOT?: Prisma.SimulationWhereInput | Prisma.SimulationWhereInput[];
    date?: Prisma.DateTimeFilter<"Simulation"> | Date | string;
    progression?: Prisma.FloatFilter<"Simulation"> | number;
    model?: Prisma.StringFilter<"Simulation"> | string;
    computedResults?: Prisma.JsonFilter<"Simulation">;
    actionChoices?: Prisma.JsonFilter<"Simulation">;
    situation?: Prisma.JsonFilter<"Simulation">;
    extendedSituation?: Prisma.JsonNullableFilter<"Simulation">;
    foldedSteps?: Prisma.JsonNullableListFilter<"Simulation">;
    userId?: Prisma.UuidNullableFilter<"Simulation"> | string | null;
    userEmail?: Prisma.StringNullableFilter<"Simulation"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Simulation"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Simulation"> | Date | string;
    states?: Prisma.SimulationStateListRelationFilter;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerListRelationFilter;
    polls?: Prisma.SimulationPollListRelationFilter;
    groups?: Prisma.GroupParticipantListRelationFilter;
    user?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
    verifiedUser?: Prisma.XOR<Prisma.VerifiedUserNullableScalarRelationFilter, Prisma.VerifiedUserWhereInput> | null;
}, "id">;
export type SimulationOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    computedResults?: Prisma.SortOrder;
    actionChoices?: Prisma.SortOrder;
    situation?: Prisma.SortOrder;
    extendedSituation?: Prisma.SortOrderInput | Prisma.SortOrder;
    foldedSteps?: Prisma.SortOrder;
    userId?: Prisma.SortOrderInput | Prisma.SortOrder;
    userEmail?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.SimulationCountOrderByAggregateInput;
    _avg?: Prisma.SimulationAvgOrderByAggregateInput;
    _max?: Prisma.SimulationMaxOrderByAggregateInput;
    _min?: Prisma.SimulationMinOrderByAggregateInput;
    _sum?: Prisma.SimulationSumOrderByAggregateInput;
};
export type SimulationScalarWhereWithAggregatesInput = {
    AND?: Prisma.SimulationScalarWhereWithAggregatesInput | Prisma.SimulationScalarWhereWithAggregatesInput[];
    OR?: Prisma.SimulationScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SimulationScalarWhereWithAggregatesInput | Prisma.SimulationScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Simulation"> | string;
    date?: Prisma.DateTimeWithAggregatesFilter<"Simulation"> | Date | string;
    progression?: Prisma.FloatWithAggregatesFilter<"Simulation"> | number;
    model?: Prisma.StringWithAggregatesFilter<"Simulation"> | string;
    computedResults?: Prisma.JsonWithAggregatesFilter<"Simulation">;
    actionChoices?: Prisma.JsonWithAggregatesFilter<"Simulation">;
    situation?: Prisma.JsonWithAggregatesFilter<"Simulation">;
    extendedSituation?: Prisma.JsonNullableWithAggregatesFilter<"Simulation">;
    foldedSteps?: Prisma.JsonNullableListFilter<"Simulation">;
    userId?: Prisma.UuidNullableWithAggregatesFilter<"Simulation"> | string | null;
    userEmail?: Prisma.StringNullableWithAggregatesFilter<"Simulation"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Simulation"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Simulation"> | Date | string;
};
export type SimulationCreateInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    states?: Prisma.SimulationStateCreateNestedManyWithoutSimulationInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerCreateNestedManyWithoutSimulationInput;
    polls?: Prisma.SimulationPollCreateNestedManyWithoutSimulationInput;
    groups?: Prisma.GroupParticipantCreateNestedManyWithoutSimulationInput;
    user?: Prisma.UserCreateNestedOneWithoutSimulationsInput;
    verifiedUser?: Prisma.VerifiedUserCreateNestedOneWithoutSimulationsInput;
};
export type SimulationUncheckedCreateInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: string | null;
    userEmail?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    states?: Prisma.SimulationStateUncheckedCreateNestedManyWithoutSimulationInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUncheckedCreateNestedManyWithoutSimulationInput;
    polls?: Prisma.SimulationPollUncheckedCreateNestedManyWithoutSimulationInput;
    groups?: Prisma.GroupParticipantUncheckedCreateNestedManyWithoutSimulationInput;
};
export type SimulationUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    states?: Prisma.SimulationStateUpdateManyWithoutSimulationNestedInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUpdateManyWithoutSimulationNestedInput;
    polls?: Prisma.SimulationPollUpdateManyWithoutSimulationNestedInput;
    groups?: Prisma.GroupParticipantUpdateManyWithoutSimulationNestedInput;
    user?: Prisma.UserUpdateOneWithoutSimulationsNestedInput;
    verifiedUser?: Prisma.VerifiedUserUpdateOneWithoutSimulationsNestedInput;
};
export type SimulationUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userEmail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    states?: Prisma.SimulationStateUncheckedUpdateManyWithoutSimulationNestedInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUncheckedUpdateManyWithoutSimulationNestedInput;
    polls?: Prisma.SimulationPollUncheckedUpdateManyWithoutSimulationNestedInput;
    groups?: Prisma.GroupParticipantUncheckedUpdateManyWithoutSimulationNestedInput;
};
export type SimulationCreateManyInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: string | null;
    userEmail?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SimulationUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SimulationUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userEmail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SimulationScalarRelationFilter = {
    is?: Prisma.SimulationWhereInput;
    isNot?: Prisma.SimulationWhereInput;
};
export type JsonNullableListFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<JsonNullableListFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableListFilterBase<$PrismaModel>>, 'path'>>, Required<JsonNullableListFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<JsonNullableListFilterBase<$PrismaModel>>, 'path'>>;
export type JsonNullableListFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue[] | Prisma.ListJsonFieldRefInput<$PrismaModel> | null;
    has?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    hasEvery?: runtime.InputJsonValue[] | Prisma.ListJsonFieldRefInput<$PrismaModel>;
    hasSome?: runtime.InputJsonValue[] | Prisma.ListJsonFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
};
export type SimulationCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    computedResults?: Prisma.SortOrder;
    actionChoices?: Prisma.SortOrder;
    situation?: Prisma.SortOrder;
    extendedSituation?: Prisma.SortOrder;
    foldedSteps?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    userEmail?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SimulationAvgOrderByAggregateInput = {
    progression?: Prisma.SortOrder;
};
export type SimulationMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    userEmail?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SimulationMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    userEmail?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SimulationSumOrderByAggregateInput = {
    progression?: Prisma.SortOrder;
};
export type SimulationListRelationFilter = {
    every?: Prisma.SimulationWhereInput;
    some?: Prisma.SimulationWhereInput;
    none?: Prisma.SimulationWhereInput;
};
export type SimulationOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type SimulationCreateNestedOneWithoutGroupsInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutGroupsInput, Prisma.SimulationUncheckedCreateWithoutGroupsInput>;
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutGroupsInput;
    connect?: Prisma.SimulationWhereUniqueInput;
};
export type SimulationUpdateOneRequiredWithoutGroupsNestedInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutGroupsInput, Prisma.SimulationUncheckedCreateWithoutGroupsInput>;
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutGroupsInput;
    upsert?: Prisma.SimulationUpsertWithoutGroupsInput;
    connect?: Prisma.SimulationWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SimulationUpdateToOneWithWhereWithoutGroupsInput, Prisma.SimulationUpdateWithoutGroupsInput>, Prisma.SimulationUncheckedUpdateWithoutGroupsInput>;
};
export type SimulationCreatefoldedStepsInput = {
    set: runtime.InputJsonValue[];
};
export type SimulationUpdatefoldedStepsInput = {
    set?: runtime.InputJsonValue[];
    push?: runtime.InputJsonValue | runtime.InputJsonValue[];
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type SimulationCreateNestedOneWithoutStatesInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutStatesInput, Prisma.SimulationUncheckedCreateWithoutStatesInput>;
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutStatesInput;
    connect?: Prisma.SimulationWhereUniqueInput;
};
export type SimulationUpdateOneRequiredWithoutStatesNestedInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutStatesInput, Prisma.SimulationUncheckedCreateWithoutStatesInput>;
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutStatesInput;
    upsert?: Prisma.SimulationUpsertWithoutStatesInput;
    connect?: Prisma.SimulationWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SimulationUpdateToOneWithWhereWithoutStatesInput, Prisma.SimulationUpdateWithoutStatesInput>, Prisma.SimulationUncheckedUpdateWithoutStatesInput>;
};
export type SimulationCreateNestedOneWithoutAdditionalQuestionsAnswersInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutAdditionalQuestionsAnswersInput, Prisma.SimulationUncheckedCreateWithoutAdditionalQuestionsAnswersInput>;
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutAdditionalQuestionsAnswersInput;
    connect?: Prisma.SimulationWhereUniqueInput;
};
export type SimulationUpdateOneRequiredWithoutAdditionalQuestionsAnswersNestedInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutAdditionalQuestionsAnswersInput, Prisma.SimulationUncheckedCreateWithoutAdditionalQuestionsAnswersInput>;
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutAdditionalQuestionsAnswersInput;
    upsert?: Prisma.SimulationUpsertWithoutAdditionalQuestionsAnswersInput;
    connect?: Prisma.SimulationWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SimulationUpdateToOneWithWhereWithoutAdditionalQuestionsAnswersInput, Prisma.SimulationUpdateWithoutAdditionalQuestionsAnswersInput>, Prisma.SimulationUncheckedUpdateWithoutAdditionalQuestionsAnswersInput>;
};
export type SimulationCreateNestedOneWithoutPollsInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutPollsInput, Prisma.SimulationUncheckedCreateWithoutPollsInput>;
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutPollsInput;
    connect?: Prisma.SimulationWhereUniqueInput;
};
export type SimulationUpdateOneRequiredWithoutPollsNestedInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutPollsInput, Prisma.SimulationUncheckedCreateWithoutPollsInput>;
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutPollsInput;
    upsert?: Prisma.SimulationUpsertWithoutPollsInput;
    connect?: Prisma.SimulationWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SimulationUpdateToOneWithWhereWithoutPollsInput, Prisma.SimulationUpdateWithoutPollsInput>, Prisma.SimulationUncheckedUpdateWithoutPollsInput>;
};
export type SimulationCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutUserInput, Prisma.SimulationUncheckedCreateWithoutUserInput> | Prisma.SimulationCreateWithoutUserInput[] | Prisma.SimulationUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutUserInput | Prisma.SimulationCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.SimulationCreateManyUserInputEnvelope;
    connect?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
};
export type SimulationUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutUserInput, Prisma.SimulationUncheckedCreateWithoutUserInput> | Prisma.SimulationCreateWithoutUserInput[] | Prisma.SimulationUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutUserInput | Prisma.SimulationCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.SimulationCreateManyUserInputEnvelope;
    connect?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
};
export type SimulationUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutUserInput, Prisma.SimulationUncheckedCreateWithoutUserInput> | Prisma.SimulationCreateWithoutUserInput[] | Prisma.SimulationUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutUserInput | Prisma.SimulationCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.SimulationUpsertWithWhereUniqueWithoutUserInput | Prisma.SimulationUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.SimulationCreateManyUserInputEnvelope;
    set?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    disconnect?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    delete?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    connect?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    update?: Prisma.SimulationUpdateWithWhereUniqueWithoutUserInput | Prisma.SimulationUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.SimulationUpdateManyWithWhereWithoutUserInput | Prisma.SimulationUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.SimulationScalarWhereInput | Prisma.SimulationScalarWhereInput[];
};
export type SimulationUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutUserInput, Prisma.SimulationUncheckedCreateWithoutUserInput> | Prisma.SimulationCreateWithoutUserInput[] | Prisma.SimulationUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutUserInput | Prisma.SimulationCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.SimulationUpsertWithWhereUniqueWithoutUserInput | Prisma.SimulationUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.SimulationCreateManyUserInputEnvelope;
    set?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    disconnect?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    delete?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    connect?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    update?: Prisma.SimulationUpdateWithWhereUniqueWithoutUserInput | Prisma.SimulationUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.SimulationUpdateManyWithWhereWithoutUserInput | Prisma.SimulationUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.SimulationScalarWhereInput | Prisma.SimulationScalarWhereInput[];
};
export type SimulationCreateNestedManyWithoutVerifiedUserInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutVerifiedUserInput, Prisma.SimulationUncheckedCreateWithoutVerifiedUserInput> | Prisma.SimulationCreateWithoutVerifiedUserInput[] | Prisma.SimulationUncheckedCreateWithoutVerifiedUserInput[];
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutVerifiedUserInput | Prisma.SimulationCreateOrConnectWithoutVerifiedUserInput[];
    createMany?: Prisma.SimulationCreateManyVerifiedUserInputEnvelope;
    connect?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
};
export type SimulationUncheckedCreateNestedManyWithoutVerifiedUserInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutVerifiedUserInput, Prisma.SimulationUncheckedCreateWithoutVerifiedUserInput> | Prisma.SimulationCreateWithoutVerifiedUserInput[] | Prisma.SimulationUncheckedCreateWithoutVerifiedUserInput[];
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutVerifiedUserInput | Prisma.SimulationCreateOrConnectWithoutVerifiedUserInput[];
    createMany?: Prisma.SimulationCreateManyVerifiedUserInputEnvelope;
    connect?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
};
export type SimulationUpdateManyWithoutVerifiedUserNestedInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutVerifiedUserInput, Prisma.SimulationUncheckedCreateWithoutVerifiedUserInput> | Prisma.SimulationCreateWithoutVerifiedUserInput[] | Prisma.SimulationUncheckedCreateWithoutVerifiedUserInput[];
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutVerifiedUserInput | Prisma.SimulationCreateOrConnectWithoutVerifiedUserInput[];
    upsert?: Prisma.SimulationUpsertWithWhereUniqueWithoutVerifiedUserInput | Prisma.SimulationUpsertWithWhereUniqueWithoutVerifiedUserInput[];
    createMany?: Prisma.SimulationCreateManyVerifiedUserInputEnvelope;
    set?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    disconnect?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    delete?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    connect?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    update?: Prisma.SimulationUpdateWithWhereUniqueWithoutVerifiedUserInput | Prisma.SimulationUpdateWithWhereUniqueWithoutVerifiedUserInput[];
    updateMany?: Prisma.SimulationUpdateManyWithWhereWithoutVerifiedUserInput | Prisma.SimulationUpdateManyWithWhereWithoutVerifiedUserInput[];
    deleteMany?: Prisma.SimulationScalarWhereInput | Prisma.SimulationScalarWhereInput[];
};
export type SimulationUncheckedUpdateManyWithoutVerifiedUserNestedInput = {
    create?: Prisma.XOR<Prisma.SimulationCreateWithoutVerifiedUserInput, Prisma.SimulationUncheckedCreateWithoutVerifiedUserInput> | Prisma.SimulationCreateWithoutVerifiedUserInput[] | Prisma.SimulationUncheckedCreateWithoutVerifiedUserInput[];
    connectOrCreate?: Prisma.SimulationCreateOrConnectWithoutVerifiedUserInput | Prisma.SimulationCreateOrConnectWithoutVerifiedUserInput[];
    upsert?: Prisma.SimulationUpsertWithWhereUniqueWithoutVerifiedUserInput | Prisma.SimulationUpsertWithWhereUniqueWithoutVerifiedUserInput[];
    createMany?: Prisma.SimulationCreateManyVerifiedUserInputEnvelope;
    set?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    disconnect?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    delete?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    connect?: Prisma.SimulationWhereUniqueInput | Prisma.SimulationWhereUniqueInput[];
    update?: Prisma.SimulationUpdateWithWhereUniqueWithoutVerifiedUserInput | Prisma.SimulationUpdateWithWhereUniqueWithoutVerifiedUserInput[];
    updateMany?: Prisma.SimulationUpdateManyWithWhereWithoutVerifiedUserInput | Prisma.SimulationUpdateManyWithWhereWithoutVerifiedUserInput[];
    deleteMany?: Prisma.SimulationScalarWhereInput | Prisma.SimulationScalarWhereInput[];
};
export type SimulationCreateWithoutGroupsInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    states?: Prisma.SimulationStateCreateNestedManyWithoutSimulationInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerCreateNestedManyWithoutSimulationInput;
    polls?: Prisma.SimulationPollCreateNestedManyWithoutSimulationInput;
    user?: Prisma.UserCreateNestedOneWithoutSimulationsInput;
    verifiedUser?: Prisma.VerifiedUserCreateNestedOneWithoutSimulationsInput;
};
export type SimulationUncheckedCreateWithoutGroupsInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: string | null;
    userEmail?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    states?: Prisma.SimulationStateUncheckedCreateNestedManyWithoutSimulationInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUncheckedCreateNestedManyWithoutSimulationInput;
    polls?: Prisma.SimulationPollUncheckedCreateNestedManyWithoutSimulationInput;
};
export type SimulationCreateOrConnectWithoutGroupsInput = {
    where: Prisma.SimulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.SimulationCreateWithoutGroupsInput, Prisma.SimulationUncheckedCreateWithoutGroupsInput>;
};
export type SimulationUpsertWithoutGroupsInput = {
    update: Prisma.XOR<Prisma.SimulationUpdateWithoutGroupsInput, Prisma.SimulationUncheckedUpdateWithoutGroupsInput>;
    create: Prisma.XOR<Prisma.SimulationCreateWithoutGroupsInput, Prisma.SimulationUncheckedCreateWithoutGroupsInput>;
    where?: Prisma.SimulationWhereInput;
};
export type SimulationUpdateToOneWithWhereWithoutGroupsInput = {
    where?: Prisma.SimulationWhereInput;
    data: Prisma.XOR<Prisma.SimulationUpdateWithoutGroupsInput, Prisma.SimulationUncheckedUpdateWithoutGroupsInput>;
};
export type SimulationUpdateWithoutGroupsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    states?: Prisma.SimulationStateUpdateManyWithoutSimulationNestedInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUpdateManyWithoutSimulationNestedInput;
    polls?: Prisma.SimulationPollUpdateManyWithoutSimulationNestedInput;
    user?: Prisma.UserUpdateOneWithoutSimulationsNestedInput;
    verifiedUser?: Prisma.VerifiedUserUpdateOneWithoutSimulationsNestedInput;
};
export type SimulationUncheckedUpdateWithoutGroupsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userEmail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    states?: Prisma.SimulationStateUncheckedUpdateManyWithoutSimulationNestedInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUncheckedUpdateManyWithoutSimulationNestedInput;
    polls?: Prisma.SimulationPollUncheckedUpdateManyWithoutSimulationNestedInput;
};
export type SimulationCreateWithoutStatesInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerCreateNestedManyWithoutSimulationInput;
    polls?: Prisma.SimulationPollCreateNestedManyWithoutSimulationInput;
    groups?: Prisma.GroupParticipantCreateNestedManyWithoutSimulationInput;
    user?: Prisma.UserCreateNestedOneWithoutSimulationsInput;
    verifiedUser?: Prisma.VerifiedUserCreateNestedOneWithoutSimulationsInput;
};
export type SimulationUncheckedCreateWithoutStatesInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: string | null;
    userEmail?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUncheckedCreateNestedManyWithoutSimulationInput;
    polls?: Prisma.SimulationPollUncheckedCreateNestedManyWithoutSimulationInput;
    groups?: Prisma.GroupParticipantUncheckedCreateNestedManyWithoutSimulationInput;
};
export type SimulationCreateOrConnectWithoutStatesInput = {
    where: Prisma.SimulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.SimulationCreateWithoutStatesInput, Prisma.SimulationUncheckedCreateWithoutStatesInput>;
};
export type SimulationUpsertWithoutStatesInput = {
    update: Prisma.XOR<Prisma.SimulationUpdateWithoutStatesInput, Prisma.SimulationUncheckedUpdateWithoutStatesInput>;
    create: Prisma.XOR<Prisma.SimulationCreateWithoutStatesInput, Prisma.SimulationUncheckedCreateWithoutStatesInput>;
    where?: Prisma.SimulationWhereInput;
};
export type SimulationUpdateToOneWithWhereWithoutStatesInput = {
    where?: Prisma.SimulationWhereInput;
    data: Prisma.XOR<Prisma.SimulationUpdateWithoutStatesInput, Prisma.SimulationUncheckedUpdateWithoutStatesInput>;
};
export type SimulationUpdateWithoutStatesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUpdateManyWithoutSimulationNestedInput;
    polls?: Prisma.SimulationPollUpdateManyWithoutSimulationNestedInput;
    groups?: Prisma.GroupParticipantUpdateManyWithoutSimulationNestedInput;
    user?: Prisma.UserUpdateOneWithoutSimulationsNestedInput;
    verifiedUser?: Prisma.VerifiedUserUpdateOneWithoutSimulationsNestedInput;
};
export type SimulationUncheckedUpdateWithoutStatesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userEmail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUncheckedUpdateManyWithoutSimulationNestedInput;
    polls?: Prisma.SimulationPollUncheckedUpdateManyWithoutSimulationNestedInput;
    groups?: Prisma.GroupParticipantUncheckedUpdateManyWithoutSimulationNestedInput;
};
export type SimulationCreateWithoutAdditionalQuestionsAnswersInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    states?: Prisma.SimulationStateCreateNestedManyWithoutSimulationInput;
    polls?: Prisma.SimulationPollCreateNestedManyWithoutSimulationInput;
    groups?: Prisma.GroupParticipantCreateNestedManyWithoutSimulationInput;
    user?: Prisma.UserCreateNestedOneWithoutSimulationsInput;
    verifiedUser?: Prisma.VerifiedUserCreateNestedOneWithoutSimulationsInput;
};
export type SimulationUncheckedCreateWithoutAdditionalQuestionsAnswersInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: string | null;
    userEmail?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    states?: Prisma.SimulationStateUncheckedCreateNestedManyWithoutSimulationInput;
    polls?: Prisma.SimulationPollUncheckedCreateNestedManyWithoutSimulationInput;
    groups?: Prisma.GroupParticipantUncheckedCreateNestedManyWithoutSimulationInput;
};
export type SimulationCreateOrConnectWithoutAdditionalQuestionsAnswersInput = {
    where: Prisma.SimulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.SimulationCreateWithoutAdditionalQuestionsAnswersInput, Prisma.SimulationUncheckedCreateWithoutAdditionalQuestionsAnswersInput>;
};
export type SimulationUpsertWithoutAdditionalQuestionsAnswersInput = {
    update: Prisma.XOR<Prisma.SimulationUpdateWithoutAdditionalQuestionsAnswersInput, Prisma.SimulationUncheckedUpdateWithoutAdditionalQuestionsAnswersInput>;
    create: Prisma.XOR<Prisma.SimulationCreateWithoutAdditionalQuestionsAnswersInput, Prisma.SimulationUncheckedCreateWithoutAdditionalQuestionsAnswersInput>;
    where?: Prisma.SimulationWhereInput;
};
export type SimulationUpdateToOneWithWhereWithoutAdditionalQuestionsAnswersInput = {
    where?: Prisma.SimulationWhereInput;
    data: Prisma.XOR<Prisma.SimulationUpdateWithoutAdditionalQuestionsAnswersInput, Prisma.SimulationUncheckedUpdateWithoutAdditionalQuestionsAnswersInput>;
};
export type SimulationUpdateWithoutAdditionalQuestionsAnswersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    states?: Prisma.SimulationStateUpdateManyWithoutSimulationNestedInput;
    polls?: Prisma.SimulationPollUpdateManyWithoutSimulationNestedInput;
    groups?: Prisma.GroupParticipantUpdateManyWithoutSimulationNestedInput;
    user?: Prisma.UserUpdateOneWithoutSimulationsNestedInput;
    verifiedUser?: Prisma.VerifiedUserUpdateOneWithoutSimulationsNestedInput;
};
export type SimulationUncheckedUpdateWithoutAdditionalQuestionsAnswersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userEmail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    states?: Prisma.SimulationStateUncheckedUpdateManyWithoutSimulationNestedInput;
    polls?: Prisma.SimulationPollUncheckedUpdateManyWithoutSimulationNestedInput;
    groups?: Prisma.GroupParticipantUncheckedUpdateManyWithoutSimulationNestedInput;
};
export type SimulationCreateWithoutPollsInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    states?: Prisma.SimulationStateCreateNestedManyWithoutSimulationInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerCreateNestedManyWithoutSimulationInput;
    groups?: Prisma.GroupParticipantCreateNestedManyWithoutSimulationInput;
    user?: Prisma.UserCreateNestedOneWithoutSimulationsInput;
    verifiedUser?: Prisma.VerifiedUserCreateNestedOneWithoutSimulationsInput;
};
export type SimulationUncheckedCreateWithoutPollsInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: string | null;
    userEmail?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    states?: Prisma.SimulationStateUncheckedCreateNestedManyWithoutSimulationInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUncheckedCreateNestedManyWithoutSimulationInput;
    groups?: Prisma.GroupParticipantUncheckedCreateNestedManyWithoutSimulationInput;
};
export type SimulationCreateOrConnectWithoutPollsInput = {
    where: Prisma.SimulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.SimulationCreateWithoutPollsInput, Prisma.SimulationUncheckedCreateWithoutPollsInput>;
};
export type SimulationUpsertWithoutPollsInput = {
    update: Prisma.XOR<Prisma.SimulationUpdateWithoutPollsInput, Prisma.SimulationUncheckedUpdateWithoutPollsInput>;
    create: Prisma.XOR<Prisma.SimulationCreateWithoutPollsInput, Prisma.SimulationUncheckedCreateWithoutPollsInput>;
    where?: Prisma.SimulationWhereInput;
};
export type SimulationUpdateToOneWithWhereWithoutPollsInput = {
    where?: Prisma.SimulationWhereInput;
    data: Prisma.XOR<Prisma.SimulationUpdateWithoutPollsInput, Prisma.SimulationUncheckedUpdateWithoutPollsInput>;
};
export type SimulationUpdateWithoutPollsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    states?: Prisma.SimulationStateUpdateManyWithoutSimulationNestedInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUpdateManyWithoutSimulationNestedInput;
    groups?: Prisma.GroupParticipantUpdateManyWithoutSimulationNestedInput;
    user?: Prisma.UserUpdateOneWithoutSimulationsNestedInput;
    verifiedUser?: Prisma.VerifiedUserUpdateOneWithoutSimulationsNestedInput;
};
export type SimulationUncheckedUpdateWithoutPollsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userEmail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    states?: Prisma.SimulationStateUncheckedUpdateManyWithoutSimulationNestedInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUncheckedUpdateManyWithoutSimulationNestedInput;
    groups?: Prisma.GroupParticipantUncheckedUpdateManyWithoutSimulationNestedInput;
};
export type SimulationCreateWithoutUserInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    states?: Prisma.SimulationStateCreateNestedManyWithoutSimulationInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerCreateNestedManyWithoutSimulationInput;
    polls?: Prisma.SimulationPollCreateNestedManyWithoutSimulationInput;
    groups?: Prisma.GroupParticipantCreateNestedManyWithoutSimulationInput;
    verifiedUser?: Prisma.VerifiedUserCreateNestedOneWithoutSimulationsInput;
};
export type SimulationUncheckedCreateWithoutUserInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    userEmail?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    states?: Prisma.SimulationStateUncheckedCreateNestedManyWithoutSimulationInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUncheckedCreateNestedManyWithoutSimulationInput;
    polls?: Prisma.SimulationPollUncheckedCreateNestedManyWithoutSimulationInput;
    groups?: Prisma.GroupParticipantUncheckedCreateNestedManyWithoutSimulationInput;
};
export type SimulationCreateOrConnectWithoutUserInput = {
    where: Prisma.SimulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.SimulationCreateWithoutUserInput, Prisma.SimulationUncheckedCreateWithoutUserInput>;
};
export type SimulationCreateManyUserInputEnvelope = {
    data: Prisma.SimulationCreateManyUserInput | Prisma.SimulationCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type SimulationUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.SimulationWhereUniqueInput;
    update: Prisma.XOR<Prisma.SimulationUpdateWithoutUserInput, Prisma.SimulationUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.SimulationCreateWithoutUserInput, Prisma.SimulationUncheckedCreateWithoutUserInput>;
};
export type SimulationUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.SimulationWhereUniqueInput;
    data: Prisma.XOR<Prisma.SimulationUpdateWithoutUserInput, Prisma.SimulationUncheckedUpdateWithoutUserInput>;
};
export type SimulationUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.SimulationScalarWhereInput;
    data: Prisma.XOR<Prisma.SimulationUpdateManyMutationInput, Prisma.SimulationUncheckedUpdateManyWithoutUserInput>;
};
export type SimulationScalarWhereInput = {
    AND?: Prisma.SimulationScalarWhereInput | Prisma.SimulationScalarWhereInput[];
    OR?: Prisma.SimulationScalarWhereInput[];
    NOT?: Prisma.SimulationScalarWhereInput | Prisma.SimulationScalarWhereInput[];
    id?: Prisma.UuidFilter<"Simulation"> | string;
    date?: Prisma.DateTimeFilter<"Simulation"> | Date | string;
    progression?: Prisma.FloatFilter<"Simulation"> | number;
    model?: Prisma.StringFilter<"Simulation"> | string;
    computedResults?: Prisma.JsonFilter<"Simulation">;
    actionChoices?: Prisma.JsonFilter<"Simulation">;
    situation?: Prisma.JsonFilter<"Simulation">;
    extendedSituation?: Prisma.JsonNullableFilter<"Simulation">;
    foldedSteps?: Prisma.JsonNullableListFilter<"Simulation">;
    userId?: Prisma.UuidNullableFilter<"Simulation"> | string | null;
    userEmail?: Prisma.StringNullableFilter<"Simulation"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Simulation"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Simulation"> | Date | string;
};
export type SimulationCreateWithoutVerifiedUserInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    states?: Prisma.SimulationStateCreateNestedManyWithoutSimulationInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerCreateNestedManyWithoutSimulationInput;
    polls?: Prisma.SimulationPollCreateNestedManyWithoutSimulationInput;
    groups?: Prisma.GroupParticipantCreateNestedManyWithoutSimulationInput;
    user?: Prisma.UserCreateNestedOneWithoutSimulationsInput;
};
export type SimulationUncheckedCreateWithoutVerifiedUserInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    states?: Prisma.SimulationStateUncheckedCreateNestedManyWithoutSimulationInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUncheckedCreateNestedManyWithoutSimulationInput;
    polls?: Prisma.SimulationPollUncheckedCreateNestedManyWithoutSimulationInput;
    groups?: Prisma.GroupParticipantUncheckedCreateNestedManyWithoutSimulationInput;
};
export type SimulationCreateOrConnectWithoutVerifiedUserInput = {
    where: Prisma.SimulationWhereUniqueInput;
    create: Prisma.XOR<Prisma.SimulationCreateWithoutVerifiedUserInput, Prisma.SimulationUncheckedCreateWithoutVerifiedUserInput>;
};
export type SimulationCreateManyVerifiedUserInputEnvelope = {
    data: Prisma.SimulationCreateManyVerifiedUserInput | Prisma.SimulationCreateManyVerifiedUserInput[];
    skipDuplicates?: boolean;
};
export type SimulationUpsertWithWhereUniqueWithoutVerifiedUserInput = {
    where: Prisma.SimulationWhereUniqueInput;
    update: Prisma.XOR<Prisma.SimulationUpdateWithoutVerifiedUserInput, Prisma.SimulationUncheckedUpdateWithoutVerifiedUserInput>;
    create: Prisma.XOR<Prisma.SimulationCreateWithoutVerifiedUserInput, Prisma.SimulationUncheckedCreateWithoutVerifiedUserInput>;
};
export type SimulationUpdateWithWhereUniqueWithoutVerifiedUserInput = {
    where: Prisma.SimulationWhereUniqueInput;
    data: Prisma.XOR<Prisma.SimulationUpdateWithoutVerifiedUserInput, Prisma.SimulationUncheckedUpdateWithoutVerifiedUserInput>;
};
export type SimulationUpdateManyWithWhereWithoutVerifiedUserInput = {
    where: Prisma.SimulationScalarWhereInput;
    data: Prisma.XOR<Prisma.SimulationUpdateManyMutationInput, Prisma.SimulationUncheckedUpdateManyWithoutVerifiedUserInput>;
};
export type SimulationCreateManyUserInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    userEmail?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SimulationUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    states?: Prisma.SimulationStateUpdateManyWithoutSimulationNestedInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUpdateManyWithoutSimulationNestedInput;
    polls?: Prisma.SimulationPollUpdateManyWithoutSimulationNestedInput;
    groups?: Prisma.GroupParticipantUpdateManyWithoutSimulationNestedInput;
    verifiedUser?: Prisma.VerifiedUserUpdateOneWithoutSimulationsNestedInput;
};
export type SimulationUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    userEmail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    states?: Prisma.SimulationStateUncheckedUpdateManyWithoutSimulationNestedInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUncheckedUpdateManyWithoutSimulationNestedInput;
    polls?: Prisma.SimulationPollUncheckedUpdateManyWithoutSimulationNestedInput;
    groups?: Prisma.GroupParticipantUncheckedUpdateManyWithoutSimulationNestedInput;
};
export type SimulationUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    userEmail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SimulationCreateManyVerifiedUserInput = {
    id?: string;
    date: Date | string;
    progression: number;
    model?: string;
    computedResults: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationCreatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SimulationUpdateWithoutVerifiedUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    states?: Prisma.SimulationStateUpdateManyWithoutSimulationNestedInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUpdateManyWithoutSimulationNestedInput;
    polls?: Prisma.SimulationPollUpdateManyWithoutSimulationNestedInput;
    groups?: Prisma.GroupParticipantUpdateManyWithoutSimulationNestedInput;
    user?: Prisma.UserUpdateOneWithoutSimulationsNestedInput;
};
export type SimulationUncheckedUpdateWithoutVerifiedUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    states?: Prisma.SimulationStateUncheckedUpdateManyWithoutSimulationNestedInput;
    additionalQuestionsAnswers?: Prisma.SimulationAdditionalQuestionAnswerUncheckedUpdateManyWithoutSimulationNestedInput;
    polls?: Prisma.SimulationPollUncheckedUpdateManyWithoutSimulationNestedInput;
    groups?: Prisma.GroupParticipantUncheckedUpdateManyWithoutSimulationNestedInput;
};
export type SimulationUncheckedUpdateManyWithoutVerifiedUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    computedResults?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    actionChoices?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    situation?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    extendedSituation?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    foldedSteps?: Prisma.SimulationUpdatefoldedStepsInput | runtime.InputJsonValue[];
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type SimulationCountOutputType
 */
export type SimulationCountOutputType = {
    states: number;
    additionalQuestionsAnswers: number;
    polls: number;
    groups: number;
};
export type SimulationCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    states?: boolean | SimulationCountOutputTypeCountStatesArgs;
    additionalQuestionsAnswers?: boolean | SimulationCountOutputTypeCountAdditionalQuestionsAnswersArgs;
    polls?: boolean | SimulationCountOutputTypeCountPollsArgs;
    groups?: boolean | SimulationCountOutputTypeCountGroupsArgs;
};
/**
 * SimulationCountOutputType without action
 */
export type SimulationCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationCountOutputType
     */
    select?: Prisma.SimulationCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * SimulationCountOutputType without action
 */
export type SimulationCountOutputTypeCountStatesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SimulationStateWhereInput;
};
/**
 * SimulationCountOutputType without action
 */
export type SimulationCountOutputTypeCountAdditionalQuestionsAnswersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SimulationAdditionalQuestionAnswerWhereInput;
};
/**
 * SimulationCountOutputType without action
 */
export type SimulationCountOutputTypeCountPollsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SimulationPollWhereInput;
};
/**
 * SimulationCountOutputType without action
 */
export type SimulationCountOutputTypeCountGroupsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GroupParticipantWhereInput;
};
export type SimulationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    progression?: boolean;
    model?: boolean;
    computedResults?: boolean;
    actionChoices?: boolean;
    situation?: boolean;
    extendedSituation?: boolean;
    foldedSteps?: boolean;
    userId?: boolean;
    userEmail?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    states?: boolean | Prisma.Simulation$statesArgs<ExtArgs>;
    additionalQuestionsAnswers?: boolean | Prisma.Simulation$additionalQuestionsAnswersArgs<ExtArgs>;
    polls?: boolean | Prisma.Simulation$pollsArgs<ExtArgs>;
    groups?: boolean | Prisma.Simulation$groupsArgs<ExtArgs>;
    user?: boolean | Prisma.Simulation$userArgs<ExtArgs>;
    verifiedUser?: boolean | Prisma.Simulation$verifiedUserArgs<ExtArgs>;
    _count?: boolean | Prisma.SimulationCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["simulation"]>;
export type SimulationSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    progression?: boolean;
    model?: boolean;
    computedResults?: boolean;
    actionChoices?: boolean;
    situation?: boolean;
    extendedSituation?: boolean;
    foldedSteps?: boolean;
    userId?: boolean;
    userEmail?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.Simulation$userArgs<ExtArgs>;
    verifiedUser?: boolean | Prisma.Simulation$verifiedUserArgs<ExtArgs>;
}, ExtArgs["result"]["simulation"]>;
export type SimulationSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    progression?: boolean;
    model?: boolean;
    computedResults?: boolean;
    actionChoices?: boolean;
    situation?: boolean;
    extendedSituation?: boolean;
    foldedSteps?: boolean;
    userId?: boolean;
    userEmail?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.Simulation$userArgs<ExtArgs>;
    verifiedUser?: boolean | Prisma.Simulation$verifiedUserArgs<ExtArgs>;
}, ExtArgs["result"]["simulation"]>;
export type SimulationSelectScalar = {
    id?: boolean;
    date?: boolean;
    progression?: boolean;
    model?: boolean;
    computedResults?: boolean;
    actionChoices?: boolean;
    situation?: boolean;
    extendedSituation?: boolean;
    foldedSteps?: boolean;
    userId?: boolean;
    userEmail?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type SimulationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "date" | "progression" | "model" | "computedResults" | "actionChoices" | "situation" | "extendedSituation" | "foldedSteps" | "userId" | "userEmail" | "createdAt" | "updatedAt", ExtArgs["result"]["simulation"]>;
export type SimulationInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    states?: boolean | Prisma.Simulation$statesArgs<ExtArgs>;
    additionalQuestionsAnswers?: boolean | Prisma.Simulation$additionalQuestionsAnswersArgs<ExtArgs>;
    polls?: boolean | Prisma.Simulation$pollsArgs<ExtArgs>;
    groups?: boolean | Prisma.Simulation$groupsArgs<ExtArgs>;
    user?: boolean | Prisma.Simulation$userArgs<ExtArgs>;
    verifiedUser?: boolean | Prisma.Simulation$verifiedUserArgs<ExtArgs>;
    _count?: boolean | Prisma.SimulationCountOutputTypeDefaultArgs<ExtArgs>;
};
export type SimulationIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.Simulation$userArgs<ExtArgs>;
    verifiedUser?: boolean | Prisma.Simulation$verifiedUserArgs<ExtArgs>;
};
export type SimulationIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.Simulation$userArgs<ExtArgs>;
    verifiedUser?: boolean | Prisma.Simulation$verifiedUserArgs<ExtArgs>;
};
export type $SimulationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Simulation";
    objects: {
        states: Prisma.$SimulationStatePayload<ExtArgs>[];
        additionalQuestionsAnswers: Prisma.$SimulationAdditionalQuestionAnswerPayload<ExtArgs>[];
        polls: Prisma.$SimulationPollPayload<ExtArgs>[];
        groups: Prisma.$GroupParticipantPayload<ExtArgs>[];
        user: Prisma.$UserPayload<ExtArgs> | null;
        verifiedUser: Prisma.$VerifiedUserPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        date: Date;
        progression: number;
        model: string;
        computedResults: runtime.JsonValue;
        actionChoices: runtime.JsonValue;
        situation: runtime.JsonValue;
        extendedSituation: runtime.JsonValue | null;
        foldedSteps: runtime.JsonValue[];
        userId: string | null;
        userEmail: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["simulation"]>;
    composites: {};
};
export type SimulationGetPayload<S extends boolean | null | undefined | SimulationDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SimulationPayload, S>;
export type SimulationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SimulationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SimulationCountAggregateInputType | true;
};
export interface SimulationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Simulation'];
        meta: {
            name: 'Simulation';
        };
    };
    /**
     * Find zero or one Simulation that matches the filter.
     * @param {SimulationFindUniqueArgs} args - Arguments to find a Simulation
     * @example
     * // Get one Simulation
     * const simulation = await prisma.simulation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SimulationFindUniqueArgs>(args: Prisma.SelectSubset<T, SimulationFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SimulationClient<runtime.Types.Result.GetResult<Prisma.$SimulationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Simulation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SimulationFindUniqueOrThrowArgs} args - Arguments to find a Simulation
     * @example
     * // Get one Simulation
     * const simulation = await prisma.simulation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SimulationFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SimulationFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SimulationClient<runtime.Types.Result.GetResult<Prisma.$SimulationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Simulation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationFindFirstArgs} args - Arguments to find a Simulation
     * @example
     * // Get one Simulation
     * const simulation = await prisma.simulation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SimulationFindFirstArgs>(args?: Prisma.SelectSubset<T, SimulationFindFirstArgs<ExtArgs>>): Prisma.Prisma__SimulationClient<runtime.Types.Result.GetResult<Prisma.$SimulationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Simulation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationFindFirstOrThrowArgs} args - Arguments to find a Simulation
     * @example
     * // Get one Simulation
     * const simulation = await prisma.simulation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SimulationFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SimulationFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SimulationClient<runtime.Types.Result.GetResult<Prisma.$SimulationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Simulations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Simulations
     * const simulations = await prisma.simulation.findMany()
     *
     * // Get first 10 Simulations
     * const simulations = await prisma.simulation.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const simulationWithIdOnly = await prisma.simulation.findMany({ select: { id: true } })
     *
     */
    findMany<T extends SimulationFindManyArgs>(args?: Prisma.SelectSubset<T, SimulationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SimulationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Simulation.
     * @param {SimulationCreateArgs} args - Arguments to create a Simulation.
     * @example
     * // Create one Simulation
     * const Simulation = await prisma.simulation.create({
     *   data: {
     *     // ... data to create a Simulation
     *   }
     * })
     *
     */
    create<T extends SimulationCreateArgs>(args: Prisma.SelectSubset<T, SimulationCreateArgs<ExtArgs>>): Prisma.Prisma__SimulationClient<runtime.Types.Result.GetResult<Prisma.$SimulationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Simulations.
     * @param {SimulationCreateManyArgs} args - Arguments to create many Simulations.
     * @example
     * // Create many Simulations
     * const simulation = await prisma.simulation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends SimulationCreateManyArgs>(args?: Prisma.SelectSubset<T, SimulationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Simulations and returns the data saved in the database.
     * @param {SimulationCreateManyAndReturnArgs} args - Arguments to create many Simulations.
     * @example
     * // Create many Simulations
     * const simulation = await prisma.simulation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Simulations and only return the `id`
     * const simulationWithIdOnly = await prisma.simulation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends SimulationCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SimulationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SimulationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Simulation.
     * @param {SimulationDeleteArgs} args - Arguments to delete one Simulation.
     * @example
     * // Delete one Simulation
     * const Simulation = await prisma.simulation.delete({
     *   where: {
     *     // ... filter to delete one Simulation
     *   }
     * })
     *
     */
    delete<T extends SimulationDeleteArgs>(args: Prisma.SelectSubset<T, SimulationDeleteArgs<ExtArgs>>): Prisma.Prisma__SimulationClient<runtime.Types.Result.GetResult<Prisma.$SimulationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Simulation.
     * @param {SimulationUpdateArgs} args - Arguments to update one Simulation.
     * @example
     * // Update one Simulation
     * const simulation = await prisma.simulation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends SimulationUpdateArgs>(args: Prisma.SelectSubset<T, SimulationUpdateArgs<ExtArgs>>): Prisma.Prisma__SimulationClient<runtime.Types.Result.GetResult<Prisma.$SimulationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Simulations.
     * @param {SimulationDeleteManyArgs} args - Arguments to filter Simulations to delete.
     * @example
     * // Delete a few Simulations
     * const { count } = await prisma.simulation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends SimulationDeleteManyArgs>(args?: Prisma.SelectSubset<T, SimulationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Simulations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Simulations
     * const simulation = await prisma.simulation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends SimulationUpdateManyArgs>(args: Prisma.SelectSubset<T, SimulationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Simulations and returns the data updated in the database.
     * @param {SimulationUpdateManyAndReturnArgs} args - Arguments to update many Simulations.
     * @example
     * // Update many Simulations
     * const simulation = await prisma.simulation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Simulations and only return the `id`
     * const simulationWithIdOnly = await prisma.simulation.updateManyAndReturn({
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
    updateManyAndReturn<T extends SimulationUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SimulationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SimulationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Simulation.
     * @param {SimulationUpsertArgs} args - Arguments to update or create a Simulation.
     * @example
     * // Update or create a Simulation
     * const simulation = await prisma.simulation.upsert({
     *   create: {
     *     // ... data to create a Simulation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Simulation we want to update
     *   }
     * })
     */
    upsert<T extends SimulationUpsertArgs>(args: Prisma.SelectSubset<T, SimulationUpsertArgs<ExtArgs>>): Prisma.Prisma__SimulationClient<runtime.Types.Result.GetResult<Prisma.$SimulationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Simulations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationCountArgs} args - Arguments to filter Simulations to count.
     * @example
     * // Count the number of Simulations
     * const count = await prisma.simulation.count({
     *   where: {
     *     // ... the filter for the Simulations we want to count
     *   }
     * })
    **/
    count<T extends SimulationCountArgs>(args?: Prisma.Subset<T, SimulationCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SimulationCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Simulation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SimulationAggregateArgs>(args: Prisma.Subset<T, SimulationAggregateArgs>): Prisma.PrismaPromise<GetSimulationAggregateType<T>>;
    /**
     * Group by Simulation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationGroupByArgs} args - Group by arguments.
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
    groupBy<T extends SimulationGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SimulationGroupByArgs['orderBy'];
    } : {
        orderBy?: SimulationGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SimulationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSimulationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Simulation model
     */
    readonly fields: SimulationFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Simulation.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__SimulationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    states<T extends Prisma.Simulation$statesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Simulation$statesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SimulationStatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    additionalQuestionsAnswers<T extends Prisma.Simulation$additionalQuestionsAnswersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Simulation$additionalQuestionsAnswersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SimulationAdditionalQuestionAnswerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    polls<T extends Prisma.Simulation$pollsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Simulation$pollsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SimulationPollPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    groups<T extends Prisma.Simulation$groupsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Simulation$groupsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    user<T extends Prisma.Simulation$userArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Simulation$userArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    verifiedUser<T extends Prisma.Simulation$verifiedUserArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Simulation$verifiedUserArgs<ExtArgs>>): Prisma.Prisma__VerifiedUserClient<runtime.Types.Result.GetResult<Prisma.$VerifiedUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the Simulation model
 */
export interface SimulationFieldRefs {
    readonly id: Prisma.FieldRef<"Simulation", 'String'>;
    readonly date: Prisma.FieldRef<"Simulation", 'DateTime'>;
    readonly progression: Prisma.FieldRef<"Simulation", 'Float'>;
    readonly model: Prisma.FieldRef<"Simulation", 'String'>;
    readonly computedResults: Prisma.FieldRef<"Simulation", 'Json'>;
    readonly actionChoices: Prisma.FieldRef<"Simulation", 'Json'>;
    readonly situation: Prisma.FieldRef<"Simulation", 'Json'>;
    readonly extendedSituation: Prisma.FieldRef<"Simulation", 'Json'>;
    readonly foldedSteps: Prisma.FieldRef<"Simulation", 'Json[]'>;
    readonly userId: Prisma.FieldRef<"Simulation", 'String'>;
    readonly userEmail: Prisma.FieldRef<"Simulation", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Simulation", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Simulation", 'DateTime'>;
}
/**
 * Simulation findUnique
 */
export type SimulationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Simulation
     */
    select?: Prisma.SimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Simulation
     */
    omit?: Prisma.SimulationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationInclude<ExtArgs> | null;
    /**
     * Filter, which Simulation to fetch.
     */
    where: Prisma.SimulationWhereUniqueInput;
};
/**
 * Simulation findUniqueOrThrow
 */
export type SimulationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Simulation
     */
    select?: Prisma.SimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Simulation
     */
    omit?: Prisma.SimulationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationInclude<ExtArgs> | null;
    /**
     * Filter, which Simulation to fetch.
     */
    where: Prisma.SimulationWhereUniqueInput;
};
/**
 * Simulation findFirst
 */
export type SimulationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Simulation
     */
    select?: Prisma.SimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Simulation
     */
    omit?: Prisma.SimulationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationInclude<ExtArgs> | null;
    /**
     * Filter, which Simulation to fetch.
     */
    where?: Prisma.SimulationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Simulations to fetch.
     */
    orderBy?: Prisma.SimulationOrderByWithRelationInput | Prisma.SimulationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Simulations.
     */
    cursor?: Prisma.SimulationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Simulations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Simulations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Simulations.
     */
    distinct?: Prisma.SimulationScalarFieldEnum | Prisma.SimulationScalarFieldEnum[];
};
/**
 * Simulation findFirstOrThrow
 */
export type SimulationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Simulation
     */
    select?: Prisma.SimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Simulation
     */
    omit?: Prisma.SimulationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationInclude<ExtArgs> | null;
    /**
     * Filter, which Simulation to fetch.
     */
    where?: Prisma.SimulationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Simulations to fetch.
     */
    orderBy?: Prisma.SimulationOrderByWithRelationInput | Prisma.SimulationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Simulations.
     */
    cursor?: Prisma.SimulationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Simulations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Simulations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Simulations.
     */
    distinct?: Prisma.SimulationScalarFieldEnum | Prisma.SimulationScalarFieldEnum[];
};
/**
 * Simulation findMany
 */
export type SimulationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Simulation
     */
    select?: Prisma.SimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Simulation
     */
    omit?: Prisma.SimulationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationInclude<ExtArgs> | null;
    /**
     * Filter, which Simulations to fetch.
     */
    where?: Prisma.SimulationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Simulations to fetch.
     */
    orderBy?: Prisma.SimulationOrderByWithRelationInput | Prisma.SimulationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Simulations.
     */
    cursor?: Prisma.SimulationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Simulations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Simulations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Simulations.
     */
    distinct?: Prisma.SimulationScalarFieldEnum | Prisma.SimulationScalarFieldEnum[];
};
/**
 * Simulation create
 */
export type SimulationCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Simulation
     */
    select?: Prisma.SimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Simulation
     */
    omit?: Prisma.SimulationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationInclude<ExtArgs> | null;
    /**
     * The data needed to create a Simulation.
     */
    data: Prisma.XOR<Prisma.SimulationCreateInput, Prisma.SimulationUncheckedCreateInput>;
};
/**
 * Simulation createMany
 */
export type SimulationCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Simulations.
     */
    data: Prisma.SimulationCreateManyInput | Prisma.SimulationCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Simulation createManyAndReturn
 */
export type SimulationCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Simulation
     */
    select?: Prisma.SimulationSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Simulation
     */
    omit?: Prisma.SimulationOmit<ExtArgs> | null;
    /**
     * The data used to create many Simulations.
     */
    data: Prisma.SimulationCreateManyInput | Prisma.SimulationCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * Simulation update
 */
export type SimulationUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Simulation
     */
    select?: Prisma.SimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Simulation
     */
    omit?: Prisma.SimulationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationInclude<ExtArgs> | null;
    /**
     * The data needed to update a Simulation.
     */
    data: Prisma.XOR<Prisma.SimulationUpdateInput, Prisma.SimulationUncheckedUpdateInput>;
    /**
     * Choose, which Simulation to update.
     */
    where: Prisma.SimulationWhereUniqueInput;
};
/**
 * Simulation updateMany
 */
export type SimulationUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Simulations.
     */
    data: Prisma.XOR<Prisma.SimulationUpdateManyMutationInput, Prisma.SimulationUncheckedUpdateManyInput>;
    /**
     * Filter which Simulations to update
     */
    where?: Prisma.SimulationWhereInput;
    /**
     * Limit how many Simulations to update.
     */
    limit?: number;
};
/**
 * Simulation updateManyAndReturn
 */
export type SimulationUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Simulation
     */
    select?: Prisma.SimulationSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Simulation
     */
    omit?: Prisma.SimulationOmit<ExtArgs> | null;
    /**
     * The data used to update Simulations.
     */
    data: Prisma.XOR<Prisma.SimulationUpdateManyMutationInput, Prisma.SimulationUncheckedUpdateManyInput>;
    /**
     * Filter which Simulations to update
     */
    where?: Prisma.SimulationWhereInput;
    /**
     * Limit how many Simulations to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * Simulation upsert
 */
export type SimulationUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Simulation
     */
    select?: Prisma.SimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Simulation
     */
    omit?: Prisma.SimulationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationInclude<ExtArgs> | null;
    /**
     * The filter to search for the Simulation to update in case it exists.
     */
    where: Prisma.SimulationWhereUniqueInput;
    /**
     * In case the Simulation found by the `where` argument doesn't exist, create a new Simulation with this data.
     */
    create: Prisma.XOR<Prisma.SimulationCreateInput, Prisma.SimulationUncheckedCreateInput>;
    /**
     * In case the Simulation was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.SimulationUpdateInput, Prisma.SimulationUncheckedUpdateInput>;
};
/**
 * Simulation delete
 */
export type SimulationDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Simulation
     */
    select?: Prisma.SimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Simulation
     */
    omit?: Prisma.SimulationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationInclude<ExtArgs> | null;
    /**
     * Filter which Simulation to delete.
     */
    where: Prisma.SimulationWhereUniqueInput;
};
/**
 * Simulation deleteMany
 */
export type SimulationDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Simulations to delete
     */
    where?: Prisma.SimulationWhereInput;
    /**
     * Limit how many Simulations to delete.
     */
    limit?: number;
};
/**
 * Simulation.states
 */
export type Simulation$statesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationState
     */
    select?: Prisma.SimulationStateSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SimulationState
     */
    omit?: Prisma.SimulationStateOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationStateInclude<ExtArgs> | null;
    where?: Prisma.SimulationStateWhereInput;
    orderBy?: Prisma.SimulationStateOrderByWithRelationInput | Prisma.SimulationStateOrderByWithRelationInput[];
    cursor?: Prisma.SimulationStateWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SimulationStateScalarFieldEnum | Prisma.SimulationStateScalarFieldEnum[];
};
/**
 * Simulation.additionalQuestionsAnswers
 */
export type Simulation$additionalQuestionsAnswersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationAdditionalQuestionAnswer
     */
    select?: Prisma.SimulationAdditionalQuestionAnswerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the SimulationAdditionalQuestionAnswer
     */
    omit?: Prisma.SimulationAdditionalQuestionAnswerOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationAdditionalQuestionAnswerInclude<ExtArgs> | null;
    where?: Prisma.SimulationAdditionalQuestionAnswerWhereInput;
    orderBy?: Prisma.SimulationAdditionalQuestionAnswerOrderByWithRelationInput | Prisma.SimulationAdditionalQuestionAnswerOrderByWithRelationInput[];
    cursor?: Prisma.SimulationAdditionalQuestionAnswerWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SimulationAdditionalQuestionAnswerScalarFieldEnum | Prisma.SimulationAdditionalQuestionAnswerScalarFieldEnum[];
};
/**
 * Simulation.polls
 */
export type Simulation$pollsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
 * Simulation.groups
 */
export type Simulation$groupsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupParticipant
     */
    select?: Prisma.GroupParticipantSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GroupParticipant
     */
    omit?: Prisma.GroupParticipantOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GroupParticipantInclude<ExtArgs> | null;
    where?: Prisma.GroupParticipantWhereInput;
    orderBy?: Prisma.GroupParticipantOrderByWithRelationInput | Prisma.GroupParticipantOrderByWithRelationInput[];
    cursor?: Prisma.GroupParticipantWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.GroupParticipantScalarFieldEnum | Prisma.GroupParticipantScalarFieldEnum[];
};
/**
 * Simulation.user
 */
export type Simulation$userArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: Prisma.UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: Prisma.UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
/**
 * Simulation.verifiedUser
 */
export type Simulation$verifiedUserArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerifiedUser
     */
    select?: Prisma.VerifiedUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerifiedUser
     */
    omit?: Prisma.VerifiedUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.VerifiedUserInclude<ExtArgs> | null;
    where?: Prisma.VerifiedUserWhereInput;
};
/**
 * Simulation without action
 */
export type SimulationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Simulation
     */
    select?: Prisma.SimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Simulation
     */
    omit?: Prisma.SimulationOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationInclude<ExtArgs> | null;
};
