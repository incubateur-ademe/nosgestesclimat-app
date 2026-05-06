import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.ts";
/**
 * Model GroupParticipant
 *
 */
export type GroupParticipantModel = runtime.Types.Result.DefaultSelection<Prisma.$GroupParticipantPayload>;
export type AggregateGroupParticipant = {
    _count: GroupParticipantCountAggregateOutputType | null;
    _min: GroupParticipantMinAggregateOutputType | null;
    _max: GroupParticipantMaxAggregateOutputType | null;
};
export type GroupParticipantMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    simulationId: string | null;
    groupId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type GroupParticipantMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    simulationId: string | null;
    groupId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type GroupParticipantCountAggregateOutputType = {
    id: number;
    userId: number;
    simulationId: number;
    groupId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type GroupParticipantMinAggregateInputType = {
    id?: true;
    userId?: true;
    simulationId?: true;
    groupId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type GroupParticipantMaxAggregateInputType = {
    id?: true;
    userId?: true;
    simulationId?: true;
    groupId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type GroupParticipantCountAggregateInputType = {
    id?: true;
    userId?: true;
    simulationId?: true;
    groupId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type GroupParticipantAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which GroupParticipant to aggregate.
     */
    where?: Prisma.GroupParticipantWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GroupParticipants to fetch.
     */
    orderBy?: Prisma.GroupParticipantOrderByWithRelationInput | Prisma.GroupParticipantOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.GroupParticipantWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GroupParticipants from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GroupParticipants.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned GroupParticipants
    **/
    _count?: true | GroupParticipantCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: GroupParticipantMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: GroupParticipantMaxAggregateInputType;
};
export type GetGroupParticipantAggregateType<T extends GroupParticipantAggregateArgs> = {
    [P in keyof T & keyof AggregateGroupParticipant]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateGroupParticipant[P]> : Prisma.GetScalarType<T[P], AggregateGroupParticipant[P]>;
};
export type GroupParticipantGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GroupParticipantWhereInput;
    orderBy?: Prisma.GroupParticipantOrderByWithAggregationInput | Prisma.GroupParticipantOrderByWithAggregationInput[];
    by: Prisma.GroupParticipantScalarFieldEnum[] | Prisma.GroupParticipantScalarFieldEnum;
    having?: Prisma.GroupParticipantScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: GroupParticipantCountAggregateInputType | true;
    _min?: GroupParticipantMinAggregateInputType;
    _max?: GroupParticipantMaxAggregateInputType;
};
export type GroupParticipantGroupByOutputType = {
    id: string;
    userId: string;
    simulationId: string;
    groupId: string;
    createdAt: Date;
    updatedAt: Date;
    _count: GroupParticipantCountAggregateOutputType | null;
    _min: GroupParticipantMinAggregateOutputType | null;
    _max: GroupParticipantMaxAggregateOutputType | null;
};
export type GetGroupParticipantGroupByPayload<T extends GroupParticipantGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<GroupParticipantGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof GroupParticipantGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], GroupParticipantGroupByOutputType[P]> : Prisma.GetScalarType<T[P], GroupParticipantGroupByOutputType[P]>;
}>>;
export type GroupParticipantWhereInput = {
    AND?: Prisma.GroupParticipantWhereInput | Prisma.GroupParticipantWhereInput[];
    OR?: Prisma.GroupParticipantWhereInput[];
    NOT?: Prisma.GroupParticipantWhereInput | Prisma.GroupParticipantWhereInput[];
    id?: Prisma.UuidFilter<"GroupParticipant"> | string;
    userId?: Prisma.UuidFilter<"GroupParticipant"> | string;
    simulationId?: Prisma.UuidFilter<"GroupParticipant"> | string;
    groupId?: Prisma.StringFilter<"GroupParticipant"> | string;
    createdAt?: Prisma.DateTimeFilter<"GroupParticipant"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"GroupParticipant"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    group?: Prisma.XOR<Prisma.GroupScalarRelationFilter, Prisma.GroupWhereInput>;
    simulation?: Prisma.XOR<Prisma.SimulationScalarRelationFilter, Prisma.SimulationWhereInput>;
};
export type GroupParticipantOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    groupId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    group?: Prisma.GroupOrderByWithRelationInput;
    simulation?: Prisma.SimulationOrderByWithRelationInput;
};
export type GroupParticipantWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    groupId_userId?: Prisma.GroupParticipantGroupIdUserIdCompoundUniqueInput;
    AND?: Prisma.GroupParticipantWhereInput | Prisma.GroupParticipantWhereInput[];
    OR?: Prisma.GroupParticipantWhereInput[];
    NOT?: Prisma.GroupParticipantWhereInput | Prisma.GroupParticipantWhereInput[];
    userId?: Prisma.UuidFilter<"GroupParticipant"> | string;
    simulationId?: Prisma.UuidFilter<"GroupParticipant"> | string;
    groupId?: Prisma.StringFilter<"GroupParticipant"> | string;
    createdAt?: Prisma.DateTimeFilter<"GroupParticipant"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"GroupParticipant"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    group?: Prisma.XOR<Prisma.GroupScalarRelationFilter, Prisma.GroupWhereInput>;
    simulation?: Prisma.XOR<Prisma.SimulationScalarRelationFilter, Prisma.SimulationWhereInput>;
}, "id" | "groupId_userId">;
export type GroupParticipantOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    groupId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.GroupParticipantCountOrderByAggregateInput;
    _max?: Prisma.GroupParticipantMaxOrderByAggregateInput;
    _min?: Prisma.GroupParticipantMinOrderByAggregateInput;
};
export type GroupParticipantScalarWhereWithAggregatesInput = {
    AND?: Prisma.GroupParticipantScalarWhereWithAggregatesInput | Prisma.GroupParticipantScalarWhereWithAggregatesInput[];
    OR?: Prisma.GroupParticipantScalarWhereWithAggregatesInput[];
    NOT?: Prisma.GroupParticipantScalarWhereWithAggregatesInput | Prisma.GroupParticipantScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"GroupParticipant"> | string;
    userId?: Prisma.UuidWithAggregatesFilter<"GroupParticipant"> | string;
    simulationId?: Prisma.UuidWithAggregatesFilter<"GroupParticipant"> | string;
    groupId?: Prisma.StringWithAggregatesFilter<"GroupParticipant"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"GroupParticipant"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"GroupParticipant"> | Date | string;
};
export type GroupParticipantCreateInput = {
    id?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutMemberInput;
    group: Prisma.GroupCreateNestedOneWithoutParticipantsInput;
    simulation: Prisma.SimulationCreateNestedOneWithoutGroupsInput;
};
export type GroupParticipantUncheckedCreateInput = {
    id?: string;
    userId: string;
    simulationId: string;
    groupId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GroupParticipantUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutMemberNestedInput;
    group?: Prisma.GroupUpdateOneRequiredWithoutParticipantsNestedInput;
    simulation?: Prisma.SimulationUpdateOneRequiredWithoutGroupsNestedInput;
};
export type GroupParticipantUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    simulationId?: Prisma.StringFieldUpdateOperationsInput | string;
    groupId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GroupParticipantCreateManyInput = {
    id?: string;
    userId: string;
    simulationId: string;
    groupId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GroupParticipantUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GroupParticipantUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    simulationId?: Prisma.StringFieldUpdateOperationsInput | string;
    groupId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GroupParticipantListRelationFilter = {
    every?: Prisma.GroupParticipantWhereInput;
    some?: Prisma.GroupParticipantWhereInput;
    none?: Prisma.GroupParticipantWhereInput;
};
export type GroupParticipantOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type GroupParticipantGroupIdUserIdCompoundUniqueInput = {
    groupId: string;
    userId: string;
};
export type GroupParticipantCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    groupId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type GroupParticipantMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    groupId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type GroupParticipantMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    groupId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type GroupParticipantCreateNestedManyWithoutGroupInput = {
    create?: Prisma.XOR<Prisma.GroupParticipantCreateWithoutGroupInput, Prisma.GroupParticipantUncheckedCreateWithoutGroupInput> | Prisma.GroupParticipantCreateWithoutGroupInput[] | Prisma.GroupParticipantUncheckedCreateWithoutGroupInput[];
    connectOrCreate?: Prisma.GroupParticipantCreateOrConnectWithoutGroupInput | Prisma.GroupParticipantCreateOrConnectWithoutGroupInput[];
    createMany?: Prisma.GroupParticipantCreateManyGroupInputEnvelope;
    connect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
};
export type GroupParticipantUncheckedCreateNestedManyWithoutGroupInput = {
    create?: Prisma.XOR<Prisma.GroupParticipantCreateWithoutGroupInput, Prisma.GroupParticipantUncheckedCreateWithoutGroupInput> | Prisma.GroupParticipantCreateWithoutGroupInput[] | Prisma.GroupParticipantUncheckedCreateWithoutGroupInput[];
    connectOrCreate?: Prisma.GroupParticipantCreateOrConnectWithoutGroupInput | Prisma.GroupParticipantCreateOrConnectWithoutGroupInput[];
    createMany?: Prisma.GroupParticipantCreateManyGroupInputEnvelope;
    connect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
};
export type GroupParticipantUpdateManyWithoutGroupNestedInput = {
    create?: Prisma.XOR<Prisma.GroupParticipantCreateWithoutGroupInput, Prisma.GroupParticipantUncheckedCreateWithoutGroupInput> | Prisma.GroupParticipantCreateWithoutGroupInput[] | Prisma.GroupParticipantUncheckedCreateWithoutGroupInput[];
    connectOrCreate?: Prisma.GroupParticipantCreateOrConnectWithoutGroupInput | Prisma.GroupParticipantCreateOrConnectWithoutGroupInput[];
    upsert?: Prisma.GroupParticipantUpsertWithWhereUniqueWithoutGroupInput | Prisma.GroupParticipantUpsertWithWhereUniqueWithoutGroupInput[];
    createMany?: Prisma.GroupParticipantCreateManyGroupInputEnvelope;
    set?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    disconnect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    delete?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    connect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    update?: Prisma.GroupParticipantUpdateWithWhereUniqueWithoutGroupInput | Prisma.GroupParticipantUpdateWithWhereUniqueWithoutGroupInput[];
    updateMany?: Prisma.GroupParticipantUpdateManyWithWhereWithoutGroupInput | Prisma.GroupParticipantUpdateManyWithWhereWithoutGroupInput[];
    deleteMany?: Prisma.GroupParticipantScalarWhereInput | Prisma.GroupParticipantScalarWhereInput[];
};
export type GroupParticipantUncheckedUpdateManyWithoutGroupNestedInput = {
    create?: Prisma.XOR<Prisma.GroupParticipantCreateWithoutGroupInput, Prisma.GroupParticipantUncheckedCreateWithoutGroupInput> | Prisma.GroupParticipantCreateWithoutGroupInput[] | Prisma.GroupParticipantUncheckedCreateWithoutGroupInput[];
    connectOrCreate?: Prisma.GroupParticipantCreateOrConnectWithoutGroupInput | Prisma.GroupParticipantCreateOrConnectWithoutGroupInput[];
    upsert?: Prisma.GroupParticipantUpsertWithWhereUniqueWithoutGroupInput | Prisma.GroupParticipantUpsertWithWhereUniqueWithoutGroupInput[];
    createMany?: Prisma.GroupParticipantCreateManyGroupInputEnvelope;
    set?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    disconnect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    delete?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    connect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    update?: Prisma.GroupParticipantUpdateWithWhereUniqueWithoutGroupInput | Prisma.GroupParticipantUpdateWithWhereUniqueWithoutGroupInput[];
    updateMany?: Prisma.GroupParticipantUpdateManyWithWhereWithoutGroupInput | Prisma.GroupParticipantUpdateManyWithWhereWithoutGroupInput[];
    deleteMany?: Prisma.GroupParticipantScalarWhereInput | Prisma.GroupParticipantScalarWhereInput[];
};
export type GroupParticipantCreateNestedManyWithoutSimulationInput = {
    create?: Prisma.XOR<Prisma.GroupParticipantCreateWithoutSimulationInput, Prisma.GroupParticipantUncheckedCreateWithoutSimulationInput> | Prisma.GroupParticipantCreateWithoutSimulationInput[] | Prisma.GroupParticipantUncheckedCreateWithoutSimulationInput[];
    connectOrCreate?: Prisma.GroupParticipantCreateOrConnectWithoutSimulationInput | Prisma.GroupParticipantCreateOrConnectWithoutSimulationInput[];
    createMany?: Prisma.GroupParticipantCreateManySimulationInputEnvelope;
    connect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
};
export type GroupParticipantUncheckedCreateNestedManyWithoutSimulationInput = {
    create?: Prisma.XOR<Prisma.GroupParticipantCreateWithoutSimulationInput, Prisma.GroupParticipantUncheckedCreateWithoutSimulationInput> | Prisma.GroupParticipantCreateWithoutSimulationInput[] | Prisma.GroupParticipantUncheckedCreateWithoutSimulationInput[];
    connectOrCreate?: Prisma.GroupParticipantCreateOrConnectWithoutSimulationInput | Prisma.GroupParticipantCreateOrConnectWithoutSimulationInput[];
    createMany?: Prisma.GroupParticipantCreateManySimulationInputEnvelope;
    connect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
};
export type GroupParticipantUpdateManyWithoutSimulationNestedInput = {
    create?: Prisma.XOR<Prisma.GroupParticipantCreateWithoutSimulationInput, Prisma.GroupParticipantUncheckedCreateWithoutSimulationInput> | Prisma.GroupParticipantCreateWithoutSimulationInput[] | Prisma.GroupParticipantUncheckedCreateWithoutSimulationInput[];
    connectOrCreate?: Prisma.GroupParticipantCreateOrConnectWithoutSimulationInput | Prisma.GroupParticipantCreateOrConnectWithoutSimulationInput[];
    upsert?: Prisma.GroupParticipantUpsertWithWhereUniqueWithoutSimulationInput | Prisma.GroupParticipantUpsertWithWhereUniqueWithoutSimulationInput[];
    createMany?: Prisma.GroupParticipantCreateManySimulationInputEnvelope;
    set?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    disconnect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    delete?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    connect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    update?: Prisma.GroupParticipantUpdateWithWhereUniqueWithoutSimulationInput | Prisma.GroupParticipantUpdateWithWhereUniqueWithoutSimulationInput[];
    updateMany?: Prisma.GroupParticipantUpdateManyWithWhereWithoutSimulationInput | Prisma.GroupParticipantUpdateManyWithWhereWithoutSimulationInput[];
    deleteMany?: Prisma.GroupParticipantScalarWhereInput | Prisma.GroupParticipantScalarWhereInput[];
};
export type GroupParticipantUncheckedUpdateManyWithoutSimulationNestedInput = {
    create?: Prisma.XOR<Prisma.GroupParticipantCreateWithoutSimulationInput, Prisma.GroupParticipantUncheckedCreateWithoutSimulationInput> | Prisma.GroupParticipantCreateWithoutSimulationInput[] | Prisma.GroupParticipantUncheckedCreateWithoutSimulationInput[];
    connectOrCreate?: Prisma.GroupParticipantCreateOrConnectWithoutSimulationInput | Prisma.GroupParticipantCreateOrConnectWithoutSimulationInput[];
    upsert?: Prisma.GroupParticipantUpsertWithWhereUniqueWithoutSimulationInput | Prisma.GroupParticipantUpsertWithWhereUniqueWithoutSimulationInput[];
    createMany?: Prisma.GroupParticipantCreateManySimulationInputEnvelope;
    set?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    disconnect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    delete?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    connect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    update?: Prisma.GroupParticipantUpdateWithWhereUniqueWithoutSimulationInput | Prisma.GroupParticipantUpdateWithWhereUniqueWithoutSimulationInput[];
    updateMany?: Prisma.GroupParticipantUpdateManyWithWhereWithoutSimulationInput | Prisma.GroupParticipantUpdateManyWithWhereWithoutSimulationInput[];
    deleteMany?: Prisma.GroupParticipantScalarWhereInput | Prisma.GroupParticipantScalarWhereInput[];
};
export type GroupParticipantCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.GroupParticipantCreateWithoutUserInput, Prisma.GroupParticipantUncheckedCreateWithoutUserInput> | Prisma.GroupParticipantCreateWithoutUserInput[] | Prisma.GroupParticipantUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.GroupParticipantCreateOrConnectWithoutUserInput | Prisma.GroupParticipantCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.GroupParticipantCreateManyUserInputEnvelope;
    connect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
};
export type GroupParticipantUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.GroupParticipantCreateWithoutUserInput, Prisma.GroupParticipantUncheckedCreateWithoutUserInput> | Prisma.GroupParticipantCreateWithoutUserInput[] | Prisma.GroupParticipantUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.GroupParticipantCreateOrConnectWithoutUserInput | Prisma.GroupParticipantCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.GroupParticipantCreateManyUserInputEnvelope;
    connect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
};
export type GroupParticipantUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.GroupParticipantCreateWithoutUserInput, Prisma.GroupParticipantUncheckedCreateWithoutUserInput> | Prisma.GroupParticipantCreateWithoutUserInput[] | Prisma.GroupParticipantUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.GroupParticipantCreateOrConnectWithoutUserInput | Prisma.GroupParticipantCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.GroupParticipantUpsertWithWhereUniqueWithoutUserInput | Prisma.GroupParticipantUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.GroupParticipantCreateManyUserInputEnvelope;
    set?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    disconnect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    delete?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    connect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    update?: Prisma.GroupParticipantUpdateWithWhereUniqueWithoutUserInput | Prisma.GroupParticipantUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.GroupParticipantUpdateManyWithWhereWithoutUserInput | Prisma.GroupParticipantUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.GroupParticipantScalarWhereInput | Prisma.GroupParticipantScalarWhereInput[];
};
export type GroupParticipantUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.GroupParticipantCreateWithoutUserInput, Prisma.GroupParticipantUncheckedCreateWithoutUserInput> | Prisma.GroupParticipantCreateWithoutUserInput[] | Prisma.GroupParticipantUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.GroupParticipantCreateOrConnectWithoutUserInput | Prisma.GroupParticipantCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.GroupParticipantUpsertWithWhereUniqueWithoutUserInput | Prisma.GroupParticipantUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.GroupParticipantCreateManyUserInputEnvelope;
    set?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    disconnect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    delete?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    connect?: Prisma.GroupParticipantWhereUniqueInput | Prisma.GroupParticipantWhereUniqueInput[];
    update?: Prisma.GroupParticipantUpdateWithWhereUniqueWithoutUserInput | Prisma.GroupParticipantUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.GroupParticipantUpdateManyWithWhereWithoutUserInput | Prisma.GroupParticipantUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.GroupParticipantScalarWhereInput | Prisma.GroupParticipantScalarWhereInput[];
};
export type GroupParticipantCreateWithoutGroupInput = {
    id?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutMemberInput;
    simulation: Prisma.SimulationCreateNestedOneWithoutGroupsInput;
};
export type GroupParticipantUncheckedCreateWithoutGroupInput = {
    id?: string;
    userId: string;
    simulationId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GroupParticipantCreateOrConnectWithoutGroupInput = {
    where: Prisma.GroupParticipantWhereUniqueInput;
    create: Prisma.XOR<Prisma.GroupParticipantCreateWithoutGroupInput, Prisma.GroupParticipantUncheckedCreateWithoutGroupInput>;
};
export type GroupParticipantCreateManyGroupInputEnvelope = {
    data: Prisma.GroupParticipantCreateManyGroupInput | Prisma.GroupParticipantCreateManyGroupInput[];
    skipDuplicates?: boolean;
};
export type GroupParticipantUpsertWithWhereUniqueWithoutGroupInput = {
    where: Prisma.GroupParticipantWhereUniqueInput;
    update: Prisma.XOR<Prisma.GroupParticipantUpdateWithoutGroupInput, Prisma.GroupParticipantUncheckedUpdateWithoutGroupInput>;
    create: Prisma.XOR<Prisma.GroupParticipantCreateWithoutGroupInput, Prisma.GroupParticipantUncheckedCreateWithoutGroupInput>;
};
export type GroupParticipantUpdateWithWhereUniqueWithoutGroupInput = {
    where: Prisma.GroupParticipantWhereUniqueInput;
    data: Prisma.XOR<Prisma.GroupParticipantUpdateWithoutGroupInput, Prisma.GroupParticipantUncheckedUpdateWithoutGroupInput>;
};
export type GroupParticipantUpdateManyWithWhereWithoutGroupInput = {
    where: Prisma.GroupParticipantScalarWhereInput;
    data: Prisma.XOR<Prisma.GroupParticipantUpdateManyMutationInput, Prisma.GroupParticipantUncheckedUpdateManyWithoutGroupInput>;
};
export type GroupParticipantScalarWhereInput = {
    AND?: Prisma.GroupParticipantScalarWhereInput | Prisma.GroupParticipantScalarWhereInput[];
    OR?: Prisma.GroupParticipantScalarWhereInput[];
    NOT?: Prisma.GroupParticipantScalarWhereInput | Prisma.GroupParticipantScalarWhereInput[];
    id?: Prisma.UuidFilter<"GroupParticipant"> | string;
    userId?: Prisma.UuidFilter<"GroupParticipant"> | string;
    simulationId?: Prisma.UuidFilter<"GroupParticipant"> | string;
    groupId?: Prisma.StringFilter<"GroupParticipant"> | string;
    createdAt?: Prisma.DateTimeFilter<"GroupParticipant"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"GroupParticipant"> | Date | string;
};
export type GroupParticipantCreateWithoutSimulationInput = {
    id?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutMemberInput;
    group: Prisma.GroupCreateNestedOneWithoutParticipantsInput;
};
export type GroupParticipantUncheckedCreateWithoutSimulationInput = {
    id?: string;
    userId: string;
    groupId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GroupParticipantCreateOrConnectWithoutSimulationInput = {
    where: Prisma.GroupParticipantWhereUniqueInput;
    create: Prisma.XOR<Prisma.GroupParticipantCreateWithoutSimulationInput, Prisma.GroupParticipantUncheckedCreateWithoutSimulationInput>;
};
export type GroupParticipantCreateManySimulationInputEnvelope = {
    data: Prisma.GroupParticipantCreateManySimulationInput | Prisma.GroupParticipantCreateManySimulationInput[];
    skipDuplicates?: boolean;
};
export type GroupParticipantUpsertWithWhereUniqueWithoutSimulationInput = {
    where: Prisma.GroupParticipantWhereUniqueInput;
    update: Prisma.XOR<Prisma.GroupParticipantUpdateWithoutSimulationInput, Prisma.GroupParticipantUncheckedUpdateWithoutSimulationInput>;
    create: Prisma.XOR<Prisma.GroupParticipantCreateWithoutSimulationInput, Prisma.GroupParticipantUncheckedCreateWithoutSimulationInput>;
};
export type GroupParticipantUpdateWithWhereUniqueWithoutSimulationInput = {
    where: Prisma.GroupParticipantWhereUniqueInput;
    data: Prisma.XOR<Prisma.GroupParticipantUpdateWithoutSimulationInput, Prisma.GroupParticipantUncheckedUpdateWithoutSimulationInput>;
};
export type GroupParticipantUpdateManyWithWhereWithoutSimulationInput = {
    where: Prisma.GroupParticipantScalarWhereInput;
    data: Prisma.XOR<Prisma.GroupParticipantUpdateManyMutationInput, Prisma.GroupParticipantUncheckedUpdateManyWithoutSimulationInput>;
};
export type GroupParticipantCreateWithoutUserInput = {
    id?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    group: Prisma.GroupCreateNestedOneWithoutParticipantsInput;
    simulation: Prisma.SimulationCreateNestedOneWithoutGroupsInput;
};
export type GroupParticipantUncheckedCreateWithoutUserInput = {
    id?: string;
    simulationId: string;
    groupId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GroupParticipantCreateOrConnectWithoutUserInput = {
    where: Prisma.GroupParticipantWhereUniqueInput;
    create: Prisma.XOR<Prisma.GroupParticipantCreateWithoutUserInput, Prisma.GroupParticipantUncheckedCreateWithoutUserInput>;
};
export type GroupParticipantCreateManyUserInputEnvelope = {
    data: Prisma.GroupParticipantCreateManyUserInput | Prisma.GroupParticipantCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type GroupParticipantUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.GroupParticipantWhereUniqueInput;
    update: Prisma.XOR<Prisma.GroupParticipantUpdateWithoutUserInput, Prisma.GroupParticipantUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.GroupParticipantCreateWithoutUserInput, Prisma.GroupParticipantUncheckedCreateWithoutUserInput>;
};
export type GroupParticipantUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.GroupParticipantWhereUniqueInput;
    data: Prisma.XOR<Prisma.GroupParticipantUpdateWithoutUserInput, Prisma.GroupParticipantUncheckedUpdateWithoutUserInput>;
};
export type GroupParticipantUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.GroupParticipantScalarWhereInput;
    data: Prisma.XOR<Prisma.GroupParticipantUpdateManyMutationInput, Prisma.GroupParticipantUncheckedUpdateManyWithoutUserInput>;
};
export type GroupParticipantCreateManyGroupInput = {
    id?: string;
    userId: string;
    simulationId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GroupParticipantUpdateWithoutGroupInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutMemberNestedInput;
    simulation?: Prisma.SimulationUpdateOneRequiredWithoutGroupsNestedInput;
};
export type GroupParticipantUncheckedUpdateWithoutGroupInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    simulationId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GroupParticipantUncheckedUpdateManyWithoutGroupInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    simulationId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GroupParticipantCreateManySimulationInput = {
    id?: string;
    userId: string;
    groupId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GroupParticipantUpdateWithoutSimulationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutMemberNestedInput;
    group?: Prisma.GroupUpdateOneRequiredWithoutParticipantsNestedInput;
};
export type GroupParticipantUncheckedUpdateWithoutSimulationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    groupId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GroupParticipantUncheckedUpdateManyWithoutSimulationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    groupId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GroupParticipantCreateManyUserInput = {
    id?: string;
    simulationId: string;
    groupId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GroupParticipantUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    group?: Prisma.GroupUpdateOneRequiredWithoutParticipantsNestedInput;
    simulation?: Prisma.SimulationUpdateOneRequiredWithoutGroupsNestedInput;
};
export type GroupParticipantUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    simulationId?: Prisma.StringFieldUpdateOperationsInput | string;
    groupId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GroupParticipantUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    simulationId?: Prisma.StringFieldUpdateOperationsInput | string;
    groupId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GroupParticipantSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    simulationId?: boolean;
    groupId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    group?: boolean | Prisma.GroupDefaultArgs<ExtArgs>;
    simulation?: boolean | Prisma.SimulationDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["groupParticipant"]>;
export type GroupParticipantSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    simulationId?: boolean;
    groupId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    group?: boolean | Prisma.GroupDefaultArgs<ExtArgs>;
    simulation?: boolean | Prisma.SimulationDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["groupParticipant"]>;
export type GroupParticipantSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    simulationId?: boolean;
    groupId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    group?: boolean | Prisma.GroupDefaultArgs<ExtArgs>;
    simulation?: boolean | Prisma.SimulationDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["groupParticipant"]>;
export type GroupParticipantSelectScalar = {
    id?: boolean;
    userId?: boolean;
    simulationId?: boolean;
    groupId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type GroupParticipantOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "simulationId" | "groupId" | "createdAt" | "updatedAt", ExtArgs["result"]["groupParticipant"]>;
export type GroupParticipantInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    group?: boolean | Prisma.GroupDefaultArgs<ExtArgs>;
    simulation?: boolean | Prisma.SimulationDefaultArgs<ExtArgs>;
};
export type GroupParticipantIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    group?: boolean | Prisma.GroupDefaultArgs<ExtArgs>;
    simulation?: boolean | Prisma.SimulationDefaultArgs<ExtArgs>;
};
export type GroupParticipantIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    group?: boolean | Prisma.GroupDefaultArgs<ExtArgs>;
    simulation?: boolean | Prisma.SimulationDefaultArgs<ExtArgs>;
};
export type $GroupParticipantPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "GroupParticipant";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        group: Prisma.$GroupPayload<ExtArgs>;
        simulation: Prisma.$SimulationPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        simulationId: string;
        groupId: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["groupParticipant"]>;
    composites: {};
};
export type GroupParticipantGetPayload<S extends boolean | null | undefined | GroupParticipantDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$GroupParticipantPayload, S>;
export type GroupParticipantCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<GroupParticipantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: GroupParticipantCountAggregateInputType | true;
};
export interface GroupParticipantDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['GroupParticipant'];
        meta: {
            name: 'GroupParticipant';
        };
    };
    /**
     * Find zero or one GroupParticipant that matches the filter.
     * @param {GroupParticipantFindUniqueArgs} args - Arguments to find a GroupParticipant
     * @example
     * // Get one GroupParticipant
     * const groupParticipant = await prisma.groupParticipant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GroupParticipantFindUniqueArgs>(args: Prisma.SelectSubset<T, GroupParticipantFindUniqueArgs<ExtArgs>>): Prisma.Prisma__GroupParticipantClient<runtime.Types.Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one GroupParticipant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GroupParticipantFindUniqueOrThrowArgs} args - Arguments to find a GroupParticipant
     * @example
     * // Get one GroupParticipant
     * const groupParticipant = await prisma.groupParticipant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GroupParticipantFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, GroupParticipantFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__GroupParticipantClient<runtime.Types.Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first GroupParticipant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupParticipantFindFirstArgs} args - Arguments to find a GroupParticipant
     * @example
     * // Get one GroupParticipant
     * const groupParticipant = await prisma.groupParticipant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GroupParticipantFindFirstArgs>(args?: Prisma.SelectSubset<T, GroupParticipantFindFirstArgs<ExtArgs>>): Prisma.Prisma__GroupParticipantClient<runtime.Types.Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first GroupParticipant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupParticipantFindFirstOrThrowArgs} args - Arguments to find a GroupParticipant
     * @example
     * // Get one GroupParticipant
     * const groupParticipant = await prisma.groupParticipant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GroupParticipantFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, GroupParticipantFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__GroupParticipantClient<runtime.Types.Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more GroupParticipants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupParticipantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GroupParticipants
     * const groupParticipants = await prisma.groupParticipant.findMany()
     *
     * // Get first 10 GroupParticipants
     * const groupParticipants = await prisma.groupParticipant.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const groupParticipantWithIdOnly = await prisma.groupParticipant.findMany({ select: { id: true } })
     *
     */
    findMany<T extends GroupParticipantFindManyArgs>(args?: Prisma.SelectSubset<T, GroupParticipantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a GroupParticipant.
     * @param {GroupParticipantCreateArgs} args - Arguments to create a GroupParticipant.
     * @example
     * // Create one GroupParticipant
     * const GroupParticipant = await prisma.groupParticipant.create({
     *   data: {
     *     // ... data to create a GroupParticipant
     *   }
     * })
     *
     */
    create<T extends GroupParticipantCreateArgs>(args: Prisma.SelectSubset<T, GroupParticipantCreateArgs<ExtArgs>>): Prisma.Prisma__GroupParticipantClient<runtime.Types.Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many GroupParticipants.
     * @param {GroupParticipantCreateManyArgs} args - Arguments to create many GroupParticipants.
     * @example
     * // Create many GroupParticipants
     * const groupParticipant = await prisma.groupParticipant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends GroupParticipantCreateManyArgs>(args?: Prisma.SelectSubset<T, GroupParticipantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many GroupParticipants and returns the data saved in the database.
     * @param {GroupParticipantCreateManyAndReturnArgs} args - Arguments to create many GroupParticipants.
     * @example
     * // Create many GroupParticipants
     * const groupParticipant = await prisma.groupParticipant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many GroupParticipants and only return the `id`
     * const groupParticipantWithIdOnly = await prisma.groupParticipant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends GroupParticipantCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, GroupParticipantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a GroupParticipant.
     * @param {GroupParticipantDeleteArgs} args - Arguments to delete one GroupParticipant.
     * @example
     * // Delete one GroupParticipant
     * const GroupParticipant = await prisma.groupParticipant.delete({
     *   where: {
     *     // ... filter to delete one GroupParticipant
     *   }
     * })
     *
     */
    delete<T extends GroupParticipantDeleteArgs>(args: Prisma.SelectSubset<T, GroupParticipantDeleteArgs<ExtArgs>>): Prisma.Prisma__GroupParticipantClient<runtime.Types.Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one GroupParticipant.
     * @param {GroupParticipantUpdateArgs} args - Arguments to update one GroupParticipant.
     * @example
     * // Update one GroupParticipant
     * const groupParticipant = await prisma.groupParticipant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends GroupParticipantUpdateArgs>(args: Prisma.SelectSubset<T, GroupParticipantUpdateArgs<ExtArgs>>): Prisma.Prisma__GroupParticipantClient<runtime.Types.Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more GroupParticipants.
     * @param {GroupParticipantDeleteManyArgs} args - Arguments to filter GroupParticipants to delete.
     * @example
     * // Delete a few GroupParticipants
     * const { count } = await prisma.groupParticipant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends GroupParticipantDeleteManyArgs>(args?: Prisma.SelectSubset<T, GroupParticipantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more GroupParticipants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupParticipantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GroupParticipants
     * const groupParticipant = await prisma.groupParticipant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends GroupParticipantUpdateManyArgs>(args: Prisma.SelectSubset<T, GroupParticipantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more GroupParticipants and returns the data updated in the database.
     * @param {GroupParticipantUpdateManyAndReturnArgs} args - Arguments to update many GroupParticipants.
     * @example
     * // Update many GroupParticipants
     * const groupParticipant = await prisma.groupParticipant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more GroupParticipants and only return the `id`
     * const groupParticipantWithIdOnly = await prisma.groupParticipant.updateManyAndReturn({
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
    updateManyAndReturn<T extends GroupParticipantUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, GroupParticipantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one GroupParticipant.
     * @param {GroupParticipantUpsertArgs} args - Arguments to update or create a GroupParticipant.
     * @example
     * // Update or create a GroupParticipant
     * const groupParticipant = await prisma.groupParticipant.upsert({
     *   create: {
     *     // ... data to create a GroupParticipant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GroupParticipant we want to update
     *   }
     * })
     */
    upsert<T extends GroupParticipantUpsertArgs>(args: Prisma.SelectSubset<T, GroupParticipantUpsertArgs<ExtArgs>>): Prisma.Prisma__GroupParticipantClient<runtime.Types.Result.GetResult<Prisma.$GroupParticipantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of GroupParticipants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupParticipantCountArgs} args - Arguments to filter GroupParticipants to count.
     * @example
     * // Count the number of GroupParticipants
     * const count = await prisma.groupParticipant.count({
     *   where: {
     *     // ... the filter for the GroupParticipants we want to count
     *   }
     * })
    **/
    count<T extends GroupParticipantCountArgs>(args?: Prisma.Subset<T, GroupParticipantCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], GroupParticipantCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a GroupParticipant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupParticipantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends GroupParticipantAggregateArgs>(args: Prisma.Subset<T, GroupParticipantAggregateArgs>): Prisma.PrismaPromise<GetGroupParticipantAggregateType<T>>;
    /**
     * Group by GroupParticipant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GroupParticipantGroupByArgs} args - Group by arguments.
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
    groupBy<T extends GroupParticipantGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: GroupParticipantGroupByArgs['orderBy'];
    } : {
        orderBy?: GroupParticipantGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, GroupParticipantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGroupParticipantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the GroupParticipant model
     */
    readonly fields: GroupParticipantFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for GroupParticipant.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__GroupParticipantClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    group<T extends Prisma.GroupDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.GroupDefaultArgs<ExtArgs>>): Prisma.Prisma__GroupClient<runtime.Types.Result.GetResult<Prisma.$GroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    simulation<T extends Prisma.SimulationDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SimulationDefaultArgs<ExtArgs>>): Prisma.Prisma__SimulationClient<runtime.Types.Result.GetResult<Prisma.$SimulationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the GroupParticipant model
 */
export interface GroupParticipantFieldRefs {
    readonly id: Prisma.FieldRef<"GroupParticipant", 'String'>;
    readonly userId: Prisma.FieldRef<"GroupParticipant", 'String'>;
    readonly simulationId: Prisma.FieldRef<"GroupParticipant", 'String'>;
    readonly groupId: Prisma.FieldRef<"GroupParticipant", 'String'>;
    readonly createdAt: Prisma.FieldRef<"GroupParticipant", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"GroupParticipant", 'DateTime'>;
}
/**
 * GroupParticipant findUnique
 */
export type GroupParticipantFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which GroupParticipant to fetch.
     */
    where: Prisma.GroupParticipantWhereUniqueInput;
};
/**
 * GroupParticipant findUniqueOrThrow
 */
export type GroupParticipantFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which GroupParticipant to fetch.
     */
    where: Prisma.GroupParticipantWhereUniqueInput;
};
/**
 * GroupParticipant findFirst
 */
export type GroupParticipantFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which GroupParticipant to fetch.
     */
    where?: Prisma.GroupParticipantWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GroupParticipants to fetch.
     */
    orderBy?: Prisma.GroupParticipantOrderByWithRelationInput | Prisma.GroupParticipantOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for GroupParticipants.
     */
    cursor?: Prisma.GroupParticipantWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GroupParticipants from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GroupParticipants.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GroupParticipants.
     */
    distinct?: Prisma.GroupParticipantScalarFieldEnum | Prisma.GroupParticipantScalarFieldEnum[];
};
/**
 * GroupParticipant findFirstOrThrow
 */
export type GroupParticipantFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which GroupParticipant to fetch.
     */
    where?: Prisma.GroupParticipantWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GroupParticipants to fetch.
     */
    orderBy?: Prisma.GroupParticipantOrderByWithRelationInput | Prisma.GroupParticipantOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for GroupParticipants.
     */
    cursor?: Prisma.GroupParticipantWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GroupParticipants from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GroupParticipants.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GroupParticipants.
     */
    distinct?: Prisma.GroupParticipantScalarFieldEnum | Prisma.GroupParticipantScalarFieldEnum[];
};
/**
 * GroupParticipant findMany
 */
export type GroupParticipantFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which GroupParticipants to fetch.
     */
    where?: Prisma.GroupParticipantWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GroupParticipants to fetch.
     */
    orderBy?: Prisma.GroupParticipantOrderByWithRelationInput | Prisma.GroupParticipantOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing GroupParticipants.
     */
    cursor?: Prisma.GroupParticipantWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GroupParticipants from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GroupParticipants.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GroupParticipants.
     */
    distinct?: Prisma.GroupParticipantScalarFieldEnum | Prisma.GroupParticipantScalarFieldEnum[];
};
/**
 * GroupParticipant create
 */
export type GroupParticipantCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a GroupParticipant.
     */
    data: Prisma.XOR<Prisma.GroupParticipantCreateInput, Prisma.GroupParticipantUncheckedCreateInput>;
};
/**
 * GroupParticipant createMany
 */
export type GroupParticipantCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many GroupParticipants.
     */
    data: Prisma.GroupParticipantCreateManyInput | Prisma.GroupParticipantCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * GroupParticipant createManyAndReturn
 */
export type GroupParticipantCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupParticipant
     */
    select?: Prisma.GroupParticipantSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the GroupParticipant
     */
    omit?: Prisma.GroupParticipantOmit<ExtArgs> | null;
    /**
     * The data used to create many GroupParticipants.
     */
    data: Prisma.GroupParticipantCreateManyInput | Prisma.GroupParticipantCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GroupParticipantIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * GroupParticipant update
 */
export type GroupParticipantUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a GroupParticipant.
     */
    data: Prisma.XOR<Prisma.GroupParticipantUpdateInput, Prisma.GroupParticipantUncheckedUpdateInput>;
    /**
     * Choose, which GroupParticipant to update.
     */
    where: Prisma.GroupParticipantWhereUniqueInput;
};
/**
 * GroupParticipant updateMany
 */
export type GroupParticipantUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update GroupParticipants.
     */
    data: Prisma.XOR<Prisma.GroupParticipantUpdateManyMutationInput, Prisma.GroupParticipantUncheckedUpdateManyInput>;
    /**
     * Filter which GroupParticipants to update
     */
    where?: Prisma.GroupParticipantWhereInput;
    /**
     * Limit how many GroupParticipants to update.
     */
    limit?: number;
};
/**
 * GroupParticipant updateManyAndReturn
 */
export type GroupParticipantUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GroupParticipant
     */
    select?: Prisma.GroupParticipantSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the GroupParticipant
     */
    omit?: Prisma.GroupParticipantOmit<ExtArgs> | null;
    /**
     * The data used to update GroupParticipants.
     */
    data: Prisma.XOR<Prisma.GroupParticipantUpdateManyMutationInput, Prisma.GroupParticipantUncheckedUpdateManyInput>;
    /**
     * Filter which GroupParticipants to update
     */
    where?: Prisma.GroupParticipantWhereInput;
    /**
     * Limit how many GroupParticipants to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GroupParticipantIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * GroupParticipant upsert
 */
export type GroupParticipantUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the GroupParticipant to update in case it exists.
     */
    where: Prisma.GroupParticipantWhereUniqueInput;
    /**
     * In case the GroupParticipant found by the `where` argument doesn't exist, create a new GroupParticipant with this data.
     */
    create: Prisma.XOR<Prisma.GroupParticipantCreateInput, Prisma.GroupParticipantUncheckedCreateInput>;
    /**
     * In case the GroupParticipant was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.GroupParticipantUpdateInput, Prisma.GroupParticipantUncheckedUpdateInput>;
};
/**
 * GroupParticipant delete
 */
export type GroupParticipantDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which GroupParticipant to delete.
     */
    where: Prisma.GroupParticipantWhereUniqueInput;
};
/**
 * GroupParticipant deleteMany
 */
export type GroupParticipantDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which GroupParticipants to delete
     */
    where?: Prisma.GroupParticipantWhereInput;
    /**
     * Limit how many GroupParticipants to delete.
     */
    limit?: number;
};
/**
 * GroupParticipant without action
 */
export type GroupParticipantDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
