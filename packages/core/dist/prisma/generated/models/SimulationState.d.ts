import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.ts";
/**
 * Model SimulationState
 *
 */
export type SimulationStateModel = runtime.Types.Result.DefaultSelection<Prisma.$SimulationStatePayload>;
export type AggregateSimulationState = {
    _count: SimulationStateCountAggregateOutputType | null;
    _avg: SimulationStateAvgAggregateOutputType | null;
    _sum: SimulationStateSumAggregateOutputType | null;
    _min: SimulationStateMinAggregateOutputType | null;
    _max: SimulationStateMaxAggregateOutputType | null;
};
export type SimulationStateAvgAggregateOutputType = {
    progression: number | null;
};
export type SimulationStateSumAggregateOutputType = {
    progression: number | null;
};
export type SimulationStateMinAggregateOutputType = {
    id: string | null;
    date: Date | null;
    simulationId: string | null;
    progression: number | null;
};
export type SimulationStateMaxAggregateOutputType = {
    id: string | null;
    date: Date | null;
    simulationId: string | null;
    progression: number | null;
};
export type SimulationStateCountAggregateOutputType = {
    id: number;
    date: number;
    simulationId: number;
    progression: number;
    _all: number;
};
export type SimulationStateAvgAggregateInputType = {
    progression?: true;
};
export type SimulationStateSumAggregateInputType = {
    progression?: true;
};
export type SimulationStateMinAggregateInputType = {
    id?: true;
    date?: true;
    simulationId?: true;
    progression?: true;
};
export type SimulationStateMaxAggregateInputType = {
    id?: true;
    date?: true;
    simulationId?: true;
    progression?: true;
};
export type SimulationStateCountAggregateInputType = {
    id?: true;
    date?: true;
    simulationId?: true;
    progression?: true;
    _all?: true;
};
export type SimulationStateAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which SimulationState to aggregate.
     */
    where?: Prisma.SimulationStateWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SimulationStates to fetch.
     */
    orderBy?: Prisma.SimulationStateOrderByWithRelationInput | Prisma.SimulationStateOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.SimulationStateWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SimulationStates from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SimulationStates.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned SimulationStates
    **/
    _count?: true | SimulationStateCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: SimulationStateAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: SimulationStateSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: SimulationStateMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: SimulationStateMaxAggregateInputType;
};
export type GetSimulationStateAggregateType<T extends SimulationStateAggregateArgs> = {
    [P in keyof T & keyof AggregateSimulationState]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSimulationState[P]> : Prisma.GetScalarType<T[P], AggregateSimulationState[P]>;
};
export type SimulationStateGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SimulationStateWhereInput;
    orderBy?: Prisma.SimulationStateOrderByWithAggregationInput | Prisma.SimulationStateOrderByWithAggregationInput[];
    by: Prisma.SimulationStateScalarFieldEnum[] | Prisma.SimulationStateScalarFieldEnum;
    having?: Prisma.SimulationStateScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SimulationStateCountAggregateInputType | true;
    _avg?: SimulationStateAvgAggregateInputType;
    _sum?: SimulationStateSumAggregateInputType;
    _min?: SimulationStateMinAggregateInputType;
    _max?: SimulationStateMaxAggregateInputType;
};
export type SimulationStateGroupByOutputType = {
    id: string;
    date: Date;
    simulationId: string;
    progression: number;
    _count: SimulationStateCountAggregateOutputType | null;
    _avg: SimulationStateAvgAggregateOutputType | null;
    _sum: SimulationStateSumAggregateOutputType | null;
    _min: SimulationStateMinAggregateOutputType | null;
    _max: SimulationStateMaxAggregateOutputType | null;
};
export type GetSimulationStateGroupByPayload<T extends SimulationStateGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SimulationStateGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SimulationStateGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SimulationStateGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SimulationStateGroupByOutputType[P]>;
}>>;
export type SimulationStateWhereInput = {
    AND?: Prisma.SimulationStateWhereInput | Prisma.SimulationStateWhereInput[];
    OR?: Prisma.SimulationStateWhereInput[];
    NOT?: Prisma.SimulationStateWhereInput | Prisma.SimulationStateWhereInput[];
    id?: Prisma.UuidFilter<"SimulationState"> | string;
    date?: Prisma.DateTimeFilter<"SimulationState"> | Date | string;
    simulationId?: Prisma.UuidFilter<"SimulationState"> | string;
    progression?: Prisma.FloatFilter<"SimulationState"> | number;
    simulation?: Prisma.XOR<Prisma.SimulationScalarRelationFilter, Prisma.SimulationWhereInput>;
};
export type SimulationStateOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
    simulation?: Prisma.SimulationOrderByWithRelationInput;
};
export type SimulationStateWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    date_simulationId?: Prisma.SimulationStateDateSimulationIdCompoundUniqueInput;
    AND?: Prisma.SimulationStateWhereInput | Prisma.SimulationStateWhereInput[];
    OR?: Prisma.SimulationStateWhereInput[];
    NOT?: Prisma.SimulationStateWhereInput | Prisma.SimulationStateWhereInput[];
    date?: Prisma.DateTimeFilter<"SimulationState"> | Date | string;
    simulationId?: Prisma.UuidFilter<"SimulationState"> | string;
    progression?: Prisma.FloatFilter<"SimulationState"> | number;
    simulation?: Prisma.XOR<Prisma.SimulationScalarRelationFilter, Prisma.SimulationWhereInput>;
}, "id" | "date_simulationId">;
export type SimulationStateOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
    _count?: Prisma.SimulationStateCountOrderByAggregateInput;
    _avg?: Prisma.SimulationStateAvgOrderByAggregateInput;
    _max?: Prisma.SimulationStateMaxOrderByAggregateInput;
    _min?: Prisma.SimulationStateMinOrderByAggregateInput;
    _sum?: Prisma.SimulationStateSumOrderByAggregateInput;
};
export type SimulationStateScalarWhereWithAggregatesInput = {
    AND?: Prisma.SimulationStateScalarWhereWithAggregatesInput | Prisma.SimulationStateScalarWhereWithAggregatesInput[];
    OR?: Prisma.SimulationStateScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SimulationStateScalarWhereWithAggregatesInput | Prisma.SimulationStateScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"SimulationState"> | string;
    date?: Prisma.DateTimeWithAggregatesFilter<"SimulationState"> | Date | string;
    simulationId?: Prisma.UuidWithAggregatesFilter<"SimulationState"> | string;
    progression?: Prisma.FloatWithAggregatesFilter<"SimulationState"> | number;
};
export type SimulationStateCreateInput = {
    id?: string;
    date: Date | string;
    progression: number;
    simulation: Prisma.SimulationCreateNestedOneWithoutStatesInput;
};
export type SimulationStateUncheckedCreateInput = {
    id?: string;
    date: Date | string;
    simulationId: string;
    progression: number;
};
export type SimulationStateUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
    simulation?: Prisma.SimulationUpdateOneRequiredWithoutStatesNestedInput;
};
export type SimulationStateUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    simulationId?: Prisma.StringFieldUpdateOperationsInput | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
};
export type SimulationStateCreateManyInput = {
    id?: string;
    date: Date | string;
    simulationId: string;
    progression: number;
};
export type SimulationStateUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
};
export type SimulationStateUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    simulationId?: Prisma.StringFieldUpdateOperationsInput | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
};
export type SimulationStateListRelationFilter = {
    every?: Prisma.SimulationStateWhereInput;
    some?: Prisma.SimulationStateWhereInput;
    none?: Prisma.SimulationStateWhereInput;
};
export type SimulationStateOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type SimulationStateDateSimulationIdCompoundUniqueInput = {
    date: Date | string;
    simulationId: string;
};
export type SimulationStateCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
};
export type SimulationStateAvgOrderByAggregateInput = {
    progression?: Prisma.SortOrder;
};
export type SimulationStateMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
};
export type SimulationStateMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
};
export type SimulationStateSumOrderByAggregateInput = {
    progression?: Prisma.SortOrder;
};
export type SimulationStateCreateNestedManyWithoutSimulationInput = {
    create?: Prisma.XOR<Prisma.SimulationStateCreateWithoutSimulationInput, Prisma.SimulationStateUncheckedCreateWithoutSimulationInput> | Prisma.SimulationStateCreateWithoutSimulationInput[] | Prisma.SimulationStateUncheckedCreateWithoutSimulationInput[];
    connectOrCreate?: Prisma.SimulationStateCreateOrConnectWithoutSimulationInput | Prisma.SimulationStateCreateOrConnectWithoutSimulationInput[];
    createMany?: Prisma.SimulationStateCreateManySimulationInputEnvelope;
    connect?: Prisma.SimulationStateWhereUniqueInput | Prisma.SimulationStateWhereUniqueInput[];
};
export type SimulationStateUncheckedCreateNestedManyWithoutSimulationInput = {
    create?: Prisma.XOR<Prisma.SimulationStateCreateWithoutSimulationInput, Prisma.SimulationStateUncheckedCreateWithoutSimulationInput> | Prisma.SimulationStateCreateWithoutSimulationInput[] | Prisma.SimulationStateUncheckedCreateWithoutSimulationInput[];
    connectOrCreate?: Prisma.SimulationStateCreateOrConnectWithoutSimulationInput | Prisma.SimulationStateCreateOrConnectWithoutSimulationInput[];
    createMany?: Prisma.SimulationStateCreateManySimulationInputEnvelope;
    connect?: Prisma.SimulationStateWhereUniqueInput | Prisma.SimulationStateWhereUniqueInput[];
};
export type SimulationStateUpdateManyWithoutSimulationNestedInput = {
    create?: Prisma.XOR<Prisma.SimulationStateCreateWithoutSimulationInput, Prisma.SimulationStateUncheckedCreateWithoutSimulationInput> | Prisma.SimulationStateCreateWithoutSimulationInput[] | Prisma.SimulationStateUncheckedCreateWithoutSimulationInput[];
    connectOrCreate?: Prisma.SimulationStateCreateOrConnectWithoutSimulationInput | Prisma.SimulationStateCreateOrConnectWithoutSimulationInput[];
    upsert?: Prisma.SimulationStateUpsertWithWhereUniqueWithoutSimulationInput | Prisma.SimulationStateUpsertWithWhereUniqueWithoutSimulationInput[];
    createMany?: Prisma.SimulationStateCreateManySimulationInputEnvelope;
    set?: Prisma.SimulationStateWhereUniqueInput | Prisma.SimulationStateWhereUniqueInput[];
    disconnect?: Prisma.SimulationStateWhereUniqueInput | Prisma.SimulationStateWhereUniqueInput[];
    delete?: Prisma.SimulationStateWhereUniqueInput | Prisma.SimulationStateWhereUniqueInput[];
    connect?: Prisma.SimulationStateWhereUniqueInput | Prisma.SimulationStateWhereUniqueInput[];
    update?: Prisma.SimulationStateUpdateWithWhereUniqueWithoutSimulationInput | Prisma.SimulationStateUpdateWithWhereUniqueWithoutSimulationInput[];
    updateMany?: Prisma.SimulationStateUpdateManyWithWhereWithoutSimulationInput | Prisma.SimulationStateUpdateManyWithWhereWithoutSimulationInput[];
    deleteMany?: Prisma.SimulationStateScalarWhereInput | Prisma.SimulationStateScalarWhereInput[];
};
export type SimulationStateUncheckedUpdateManyWithoutSimulationNestedInput = {
    create?: Prisma.XOR<Prisma.SimulationStateCreateWithoutSimulationInput, Prisma.SimulationStateUncheckedCreateWithoutSimulationInput> | Prisma.SimulationStateCreateWithoutSimulationInput[] | Prisma.SimulationStateUncheckedCreateWithoutSimulationInput[];
    connectOrCreate?: Prisma.SimulationStateCreateOrConnectWithoutSimulationInput | Prisma.SimulationStateCreateOrConnectWithoutSimulationInput[];
    upsert?: Prisma.SimulationStateUpsertWithWhereUniqueWithoutSimulationInput | Prisma.SimulationStateUpsertWithWhereUniqueWithoutSimulationInput[];
    createMany?: Prisma.SimulationStateCreateManySimulationInputEnvelope;
    set?: Prisma.SimulationStateWhereUniqueInput | Prisma.SimulationStateWhereUniqueInput[];
    disconnect?: Prisma.SimulationStateWhereUniqueInput | Prisma.SimulationStateWhereUniqueInput[];
    delete?: Prisma.SimulationStateWhereUniqueInput | Prisma.SimulationStateWhereUniqueInput[];
    connect?: Prisma.SimulationStateWhereUniqueInput | Prisma.SimulationStateWhereUniqueInput[];
    update?: Prisma.SimulationStateUpdateWithWhereUniqueWithoutSimulationInput | Prisma.SimulationStateUpdateWithWhereUniqueWithoutSimulationInput[];
    updateMany?: Prisma.SimulationStateUpdateManyWithWhereWithoutSimulationInput | Prisma.SimulationStateUpdateManyWithWhereWithoutSimulationInput[];
    deleteMany?: Prisma.SimulationStateScalarWhereInput | Prisma.SimulationStateScalarWhereInput[];
};
export type SimulationStateCreateWithoutSimulationInput = {
    id?: string;
    date: Date | string;
    progression: number;
};
export type SimulationStateUncheckedCreateWithoutSimulationInput = {
    id?: string;
    date: Date | string;
    progression: number;
};
export type SimulationStateCreateOrConnectWithoutSimulationInput = {
    where: Prisma.SimulationStateWhereUniqueInput;
    create: Prisma.XOR<Prisma.SimulationStateCreateWithoutSimulationInput, Prisma.SimulationStateUncheckedCreateWithoutSimulationInput>;
};
export type SimulationStateCreateManySimulationInputEnvelope = {
    data: Prisma.SimulationStateCreateManySimulationInput | Prisma.SimulationStateCreateManySimulationInput[];
    skipDuplicates?: boolean;
};
export type SimulationStateUpsertWithWhereUniqueWithoutSimulationInput = {
    where: Prisma.SimulationStateWhereUniqueInput;
    update: Prisma.XOR<Prisma.SimulationStateUpdateWithoutSimulationInput, Prisma.SimulationStateUncheckedUpdateWithoutSimulationInput>;
    create: Prisma.XOR<Prisma.SimulationStateCreateWithoutSimulationInput, Prisma.SimulationStateUncheckedCreateWithoutSimulationInput>;
};
export type SimulationStateUpdateWithWhereUniqueWithoutSimulationInput = {
    where: Prisma.SimulationStateWhereUniqueInput;
    data: Prisma.XOR<Prisma.SimulationStateUpdateWithoutSimulationInput, Prisma.SimulationStateUncheckedUpdateWithoutSimulationInput>;
};
export type SimulationStateUpdateManyWithWhereWithoutSimulationInput = {
    where: Prisma.SimulationStateScalarWhereInput;
    data: Prisma.XOR<Prisma.SimulationStateUpdateManyMutationInput, Prisma.SimulationStateUncheckedUpdateManyWithoutSimulationInput>;
};
export type SimulationStateScalarWhereInput = {
    AND?: Prisma.SimulationStateScalarWhereInput | Prisma.SimulationStateScalarWhereInput[];
    OR?: Prisma.SimulationStateScalarWhereInput[];
    NOT?: Prisma.SimulationStateScalarWhereInput | Prisma.SimulationStateScalarWhereInput[];
    id?: Prisma.UuidFilter<"SimulationState"> | string;
    date?: Prisma.DateTimeFilter<"SimulationState"> | Date | string;
    simulationId?: Prisma.UuidFilter<"SimulationState"> | string;
    progression?: Prisma.FloatFilter<"SimulationState"> | number;
};
export type SimulationStateCreateManySimulationInput = {
    id?: string;
    date: Date | string;
    progression: number;
};
export type SimulationStateUpdateWithoutSimulationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
};
export type SimulationStateUncheckedUpdateWithoutSimulationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
};
export type SimulationStateUncheckedUpdateManyWithoutSimulationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    progression?: Prisma.FloatFieldUpdateOperationsInput | number;
};
export type SimulationStateSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    simulationId?: boolean;
    progression?: boolean;
    simulation?: boolean | Prisma.SimulationDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["simulationState"]>;
export type SimulationStateSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    simulationId?: boolean;
    progression?: boolean;
    simulation?: boolean | Prisma.SimulationDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["simulationState"]>;
export type SimulationStateSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    simulationId?: boolean;
    progression?: boolean;
    simulation?: boolean | Prisma.SimulationDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["simulationState"]>;
export type SimulationStateSelectScalar = {
    id?: boolean;
    date?: boolean;
    simulationId?: boolean;
    progression?: boolean;
};
export type SimulationStateOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "date" | "simulationId" | "progression", ExtArgs["result"]["simulationState"]>;
export type SimulationStateInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    simulation?: boolean | Prisma.SimulationDefaultArgs<ExtArgs>;
};
export type SimulationStateIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    simulation?: boolean | Prisma.SimulationDefaultArgs<ExtArgs>;
};
export type SimulationStateIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    simulation?: boolean | Prisma.SimulationDefaultArgs<ExtArgs>;
};
export type $SimulationStatePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "SimulationState";
    objects: {
        simulation: Prisma.$SimulationPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        date: Date;
        simulationId: string;
        progression: number;
    }, ExtArgs["result"]["simulationState"]>;
    composites: {};
};
export type SimulationStateGetPayload<S extends boolean | null | undefined | SimulationStateDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SimulationStatePayload, S>;
export type SimulationStateCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SimulationStateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SimulationStateCountAggregateInputType | true;
};
export interface SimulationStateDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['SimulationState'];
        meta: {
            name: 'SimulationState';
        };
    };
    /**
     * Find zero or one SimulationState that matches the filter.
     * @param {SimulationStateFindUniqueArgs} args - Arguments to find a SimulationState
     * @example
     * // Get one SimulationState
     * const simulationState = await prisma.simulationState.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SimulationStateFindUniqueArgs>(args: Prisma.SelectSubset<T, SimulationStateFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SimulationStateClient<runtime.Types.Result.GetResult<Prisma.$SimulationStatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one SimulationState that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SimulationStateFindUniqueOrThrowArgs} args - Arguments to find a SimulationState
     * @example
     * // Get one SimulationState
     * const simulationState = await prisma.simulationState.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SimulationStateFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SimulationStateFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SimulationStateClient<runtime.Types.Result.GetResult<Prisma.$SimulationStatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first SimulationState that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationStateFindFirstArgs} args - Arguments to find a SimulationState
     * @example
     * // Get one SimulationState
     * const simulationState = await prisma.simulationState.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SimulationStateFindFirstArgs>(args?: Prisma.SelectSubset<T, SimulationStateFindFirstArgs<ExtArgs>>): Prisma.Prisma__SimulationStateClient<runtime.Types.Result.GetResult<Prisma.$SimulationStatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first SimulationState that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationStateFindFirstOrThrowArgs} args - Arguments to find a SimulationState
     * @example
     * // Get one SimulationState
     * const simulationState = await prisma.simulationState.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SimulationStateFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SimulationStateFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SimulationStateClient<runtime.Types.Result.GetResult<Prisma.$SimulationStatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more SimulationStates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationStateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SimulationStates
     * const simulationStates = await prisma.simulationState.findMany()
     *
     * // Get first 10 SimulationStates
     * const simulationStates = await prisma.simulationState.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const simulationStateWithIdOnly = await prisma.simulationState.findMany({ select: { id: true } })
     *
     */
    findMany<T extends SimulationStateFindManyArgs>(args?: Prisma.SelectSubset<T, SimulationStateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SimulationStatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a SimulationState.
     * @param {SimulationStateCreateArgs} args - Arguments to create a SimulationState.
     * @example
     * // Create one SimulationState
     * const SimulationState = await prisma.simulationState.create({
     *   data: {
     *     // ... data to create a SimulationState
     *   }
     * })
     *
     */
    create<T extends SimulationStateCreateArgs>(args: Prisma.SelectSubset<T, SimulationStateCreateArgs<ExtArgs>>): Prisma.Prisma__SimulationStateClient<runtime.Types.Result.GetResult<Prisma.$SimulationStatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many SimulationStates.
     * @param {SimulationStateCreateManyArgs} args - Arguments to create many SimulationStates.
     * @example
     * // Create many SimulationStates
     * const simulationState = await prisma.simulationState.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends SimulationStateCreateManyArgs>(args?: Prisma.SelectSubset<T, SimulationStateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many SimulationStates and returns the data saved in the database.
     * @param {SimulationStateCreateManyAndReturnArgs} args - Arguments to create many SimulationStates.
     * @example
     * // Create many SimulationStates
     * const simulationState = await prisma.simulationState.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many SimulationStates and only return the `id`
     * const simulationStateWithIdOnly = await prisma.simulationState.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends SimulationStateCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SimulationStateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SimulationStatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a SimulationState.
     * @param {SimulationStateDeleteArgs} args - Arguments to delete one SimulationState.
     * @example
     * // Delete one SimulationState
     * const SimulationState = await prisma.simulationState.delete({
     *   where: {
     *     // ... filter to delete one SimulationState
     *   }
     * })
     *
     */
    delete<T extends SimulationStateDeleteArgs>(args: Prisma.SelectSubset<T, SimulationStateDeleteArgs<ExtArgs>>): Prisma.Prisma__SimulationStateClient<runtime.Types.Result.GetResult<Prisma.$SimulationStatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one SimulationState.
     * @param {SimulationStateUpdateArgs} args - Arguments to update one SimulationState.
     * @example
     * // Update one SimulationState
     * const simulationState = await prisma.simulationState.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends SimulationStateUpdateArgs>(args: Prisma.SelectSubset<T, SimulationStateUpdateArgs<ExtArgs>>): Prisma.Prisma__SimulationStateClient<runtime.Types.Result.GetResult<Prisma.$SimulationStatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more SimulationStates.
     * @param {SimulationStateDeleteManyArgs} args - Arguments to filter SimulationStates to delete.
     * @example
     * // Delete a few SimulationStates
     * const { count } = await prisma.simulationState.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends SimulationStateDeleteManyArgs>(args?: Prisma.SelectSubset<T, SimulationStateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more SimulationStates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationStateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SimulationStates
     * const simulationState = await prisma.simulationState.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends SimulationStateUpdateManyArgs>(args: Prisma.SelectSubset<T, SimulationStateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more SimulationStates and returns the data updated in the database.
     * @param {SimulationStateUpdateManyAndReturnArgs} args - Arguments to update many SimulationStates.
     * @example
     * // Update many SimulationStates
     * const simulationState = await prisma.simulationState.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more SimulationStates and only return the `id`
     * const simulationStateWithIdOnly = await prisma.simulationState.updateManyAndReturn({
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
    updateManyAndReturn<T extends SimulationStateUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SimulationStateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SimulationStatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one SimulationState.
     * @param {SimulationStateUpsertArgs} args - Arguments to update or create a SimulationState.
     * @example
     * // Update or create a SimulationState
     * const simulationState = await prisma.simulationState.upsert({
     *   create: {
     *     // ... data to create a SimulationState
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SimulationState we want to update
     *   }
     * })
     */
    upsert<T extends SimulationStateUpsertArgs>(args: Prisma.SelectSubset<T, SimulationStateUpsertArgs<ExtArgs>>): Prisma.Prisma__SimulationStateClient<runtime.Types.Result.GetResult<Prisma.$SimulationStatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of SimulationStates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationStateCountArgs} args - Arguments to filter SimulationStates to count.
     * @example
     * // Count the number of SimulationStates
     * const count = await prisma.simulationState.count({
     *   where: {
     *     // ... the filter for the SimulationStates we want to count
     *   }
     * })
    **/
    count<T extends SimulationStateCountArgs>(args?: Prisma.Subset<T, SimulationStateCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SimulationStateCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a SimulationState.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationStateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SimulationStateAggregateArgs>(args: Prisma.Subset<T, SimulationStateAggregateArgs>): Prisma.PrismaPromise<GetSimulationStateAggregateType<T>>;
    /**
     * Group by SimulationState.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SimulationStateGroupByArgs} args - Group by arguments.
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
    groupBy<T extends SimulationStateGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SimulationStateGroupByArgs['orderBy'];
    } : {
        orderBy?: SimulationStateGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SimulationStateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSimulationStateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the SimulationState model
     */
    readonly fields: SimulationStateFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for SimulationState.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__SimulationStateClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
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
 * Fields of the SimulationState model
 */
export interface SimulationStateFieldRefs {
    readonly id: Prisma.FieldRef<"SimulationState", 'String'>;
    readonly date: Prisma.FieldRef<"SimulationState", 'DateTime'>;
    readonly simulationId: Prisma.FieldRef<"SimulationState", 'String'>;
    readonly progression: Prisma.FieldRef<"SimulationState", 'Float'>;
}
/**
 * SimulationState findUnique
 */
export type SimulationStateFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which SimulationState to fetch.
     */
    where: Prisma.SimulationStateWhereUniqueInput;
};
/**
 * SimulationState findUniqueOrThrow
 */
export type SimulationStateFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which SimulationState to fetch.
     */
    where: Prisma.SimulationStateWhereUniqueInput;
};
/**
 * SimulationState findFirst
 */
export type SimulationStateFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which SimulationState to fetch.
     */
    where?: Prisma.SimulationStateWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SimulationStates to fetch.
     */
    orderBy?: Prisma.SimulationStateOrderByWithRelationInput | Prisma.SimulationStateOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for SimulationStates.
     */
    cursor?: Prisma.SimulationStateWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SimulationStates from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SimulationStates.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of SimulationStates.
     */
    distinct?: Prisma.SimulationStateScalarFieldEnum | Prisma.SimulationStateScalarFieldEnum[];
};
/**
 * SimulationState findFirstOrThrow
 */
export type SimulationStateFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which SimulationState to fetch.
     */
    where?: Prisma.SimulationStateWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SimulationStates to fetch.
     */
    orderBy?: Prisma.SimulationStateOrderByWithRelationInput | Prisma.SimulationStateOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for SimulationStates.
     */
    cursor?: Prisma.SimulationStateWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SimulationStates from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SimulationStates.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of SimulationStates.
     */
    distinct?: Prisma.SimulationStateScalarFieldEnum | Prisma.SimulationStateScalarFieldEnum[];
};
/**
 * SimulationState findMany
 */
export type SimulationStateFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which SimulationStates to fetch.
     */
    where?: Prisma.SimulationStateWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of SimulationStates to fetch.
     */
    orderBy?: Prisma.SimulationStateOrderByWithRelationInput | Prisma.SimulationStateOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing SimulationStates.
     */
    cursor?: Prisma.SimulationStateWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` SimulationStates from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` SimulationStates.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of SimulationStates.
     */
    distinct?: Prisma.SimulationStateScalarFieldEnum | Prisma.SimulationStateScalarFieldEnum[];
};
/**
 * SimulationState create
 */
export type SimulationStateCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a SimulationState.
     */
    data: Prisma.XOR<Prisma.SimulationStateCreateInput, Prisma.SimulationStateUncheckedCreateInput>;
};
/**
 * SimulationState createMany
 */
export type SimulationStateCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many SimulationStates.
     */
    data: Prisma.SimulationStateCreateManyInput | Prisma.SimulationStateCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * SimulationState createManyAndReturn
 */
export type SimulationStateCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationState
     */
    select?: Prisma.SimulationStateSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the SimulationState
     */
    omit?: Prisma.SimulationStateOmit<ExtArgs> | null;
    /**
     * The data used to create many SimulationStates.
     */
    data: Prisma.SimulationStateCreateManyInput | Prisma.SimulationStateCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationStateIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * SimulationState update
 */
export type SimulationStateUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a SimulationState.
     */
    data: Prisma.XOR<Prisma.SimulationStateUpdateInput, Prisma.SimulationStateUncheckedUpdateInput>;
    /**
     * Choose, which SimulationState to update.
     */
    where: Prisma.SimulationStateWhereUniqueInput;
};
/**
 * SimulationState updateMany
 */
export type SimulationStateUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update SimulationStates.
     */
    data: Prisma.XOR<Prisma.SimulationStateUpdateManyMutationInput, Prisma.SimulationStateUncheckedUpdateManyInput>;
    /**
     * Filter which SimulationStates to update
     */
    where?: Prisma.SimulationStateWhereInput;
    /**
     * Limit how many SimulationStates to update.
     */
    limit?: number;
};
/**
 * SimulationState updateManyAndReturn
 */
export type SimulationStateUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SimulationState
     */
    select?: Prisma.SimulationStateSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the SimulationState
     */
    omit?: Prisma.SimulationStateOmit<ExtArgs> | null;
    /**
     * The data used to update SimulationStates.
     */
    data: Prisma.XOR<Prisma.SimulationStateUpdateManyMutationInput, Prisma.SimulationStateUncheckedUpdateManyInput>;
    /**
     * Filter which SimulationStates to update
     */
    where?: Prisma.SimulationStateWhereInput;
    /**
     * Limit how many SimulationStates to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SimulationStateIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * SimulationState upsert
 */
export type SimulationStateUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the SimulationState to update in case it exists.
     */
    where: Prisma.SimulationStateWhereUniqueInput;
    /**
     * In case the SimulationState found by the `where` argument doesn't exist, create a new SimulationState with this data.
     */
    create: Prisma.XOR<Prisma.SimulationStateCreateInput, Prisma.SimulationStateUncheckedCreateInput>;
    /**
     * In case the SimulationState was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.SimulationStateUpdateInput, Prisma.SimulationStateUncheckedUpdateInput>;
};
/**
 * SimulationState delete
 */
export type SimulationStateDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which SimulationState to delete.
     */
    where: Prisma.SimulationStateWhereUniqueInput;
};
/**
 * SimulationState deleteMany
 */
export type SimulationStateDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which SimulationStates to delete
     */
    where?: Prisma.SimulationStateWhereInput;
    /**
     * Limit how many SimulationStates to delete.
     */
    limit?: number;
};
/**
 * SimulationState without action
 */
export type SimulationStateDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
