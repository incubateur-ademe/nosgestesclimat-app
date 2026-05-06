import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.ts";
/**
 * Model AnonSimulation
 *
 */
export type AnonSimulationModel = runtime.Types.Result.DefaultSelection<Prisma.$AnonSimulationPayload>;
export type AggregateAnonSimulation = {
    _count: AnonSimulationCountAggregateOutputType | null;
    _avg: AnonSimulationAvgAggregateOutputType | null;
    _sum: AnonSimulationSumAggregateOutputType | null;
    _min: AnonSimulationMinAggregateOutputType | null;
    _max: AnonSimulationMaxAggregateOutputType | null;
};
export type AnonSimulationAvgAggregateOutputType = {
    progression: number | null;
};
export type AnonSimulationSumAggregateOutputType = {
    progression: number | null;
};
export type AnonSimulationMinAggregateOutputType = {
    id: string | null;
    date: Date | null;
    progression: number | null;
    model: string | null;
    userId: string | null;
    userEmail: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type AnonSimulationMaxAggregateOutputType = {
    id: string | null;
    date: Date | null;
    progression: number | null;
    model: string | null;
    userId: string | null;
    userEmail: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type AnonSimulationCountAggregateOutputType = {
    id: number;
    date: number;
    progression: number;
    model: number;
    computedResults: number;
    actionChoices: number;
    situation: number;
    foldedSteps: number;
    userId: number;
    userEmail: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type AnonSimulationAvgAggregateInputType = {
    progression?: true;
};
export type AnonSimulationSumAggregateInputType = {
    progression?: true;
};
export type AnonSimulationMinAggregateInputType = {
    id?: true;
    date?: true;
    progression?: true;
    model?: true;
    userId?: true;
    userEmail?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type AnonSimulationMaxAggregateInputType = {
    id?: true;
    date?: true;
    progression?: true;
    model?: true;
    userId?: true;
    userEmail?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type AnonSimulationCountAggregateInputType = {
    id?: true;
    date?: true;
    progression?: true;
    model?: true;
    computedResults?: true;
    actionChoices?: true;
    situation?: true;
    foldedSteps?: true;
    userId?: true;
    userEmail?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type AnonSimulationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which AnonSimulation to aggregate.
     */
    where?: Prisma.AnonSimulationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnonSimulations to fetch.
     */
    orderBy?: Prisma.AnonSimulationOrderByWithRelationInput | Prisma.AnonSimulationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.AnonSimulationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnonSimulations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnonSimulations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned AnonSimulations
    **/
    _count?: true | AnonSimulationCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: AnonSimulationAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: AnonSimulationSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: AnonSimulationMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: AnonSimulationMaxAggregateInputType;
};
export type GetAnonSimulationAggregateType<T extends AnonSimulationAggregateArgs> = {
    [P in keyof T & keyof AggregateAnonSimulation]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAnonSimulation[P]> : Prisma.GetScalarType<T[P], AggregateAnonSimulation[P]>;
};
export type AnonSimulationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AnonSimulationWhereInput;
    orderBy?: Prisma.AnonSimulationOrderByWithAggregationInput | Prisma.AnonSimulationOrderByWithAggregationInput[];
    by: Prisma.AnonSimulationScalarFieldEnum[] | Prisma.AnonSimulationScalarFieldEnum;
    having?: Prisma.AnonSimulationScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AnonSimulationCountAggregateInputType | true;
    _avg?: AnonSimulationAvgAggregateInputType;
    _sum?: AnonSimulationSumAggregateInputType;
    _min?: AnonSimulationMinAggregateInputType;
    _max?: AnonSimulationMaxAggregateInputType;
};
export type AnonSimulationGroupByOutputType = {
    id: string;
    date: Date;
    progression: number;
    model: string;
    computedResults: runtime.JsonValue;
    actionChoices: runtime.JsonValue;
    situation: runtime.JsonValue;
    foldedSteps: runtime.JsonValue[];
    userId: string;
    userEmail: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: AnonSimulationCountAggregateOutputType | null;
    _avg: AnonSimulationAvgAggregateOutputType | null;
    _sum: AnonSimulationSumAggregateOutputType | null;
    _min: AnonSimulationMinAggregateOutputType | null;
    _max: AnonSimulationMaxAggregateOutputType | null;
};
export type GetAnonSimulationGroupByPayload<T extends AnonSimulationGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AnonSimulationGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AnonSimulationGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AnonSimulationGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AnonSimulationGroupByOutputType[P]>;
}>>;
export type AnonSimulationWhereInput = {
    AND?: Prisma.AnonSimulationWhereInput | Prisma.AnonSimulationWhereInput[];
    OR?: Prisma.AnonSimulationWhereInput[];
    NOT?: Prisma.AnonSimulationWhereInput | Prisma.AnonSimulationWhereInput[];
    id?: Prisma.UuidFilter<"AnonSimulation"> | string;
    date?: Prisma.DateTimeFilter<"AnonSimulation"> | Date | string;
    progression?: Prisma.FloatFilter<"AnonSimulation"> | number;
    model?: Prisma.StringFilter<"AnonSimulation"> | string;
    computedResults?: Prisma.JsonFilter<"AnonSimulation">;
    actionChoices?: Prisma.JsonFilter<"AnonSimulation">;
    situation?: Prisma.JsonFilter<"AnonSimulation">;
    foldedSteps?: Prisma.JsonNullableListFilter<"AnonSimulation">;
    userId?: Prisma.UuidFilter<"AnonSimulation"> | string;
    userEmail?: Prisma.StringNullableFilter<"AnonSimulation"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"AnonSimulation"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"AnonSimulation"> | Date | string;
};
export type AnonSimulationOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    computedResults?: Prisma.SortOrder;
    actionChoices?: Prisma.SortOrder;
    situation?: Prisma.SortOrder;
    foldedSteps?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    userEmail?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AnonSimulationWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.AnonSimulationWhereInput | Prisma.AnonSimulationWhereInput[];
    OR?: Prisma.AnonSimulationWhereInput[];
    NOT?: Prisma.AnonSimulationWhereInput | Prisma.AnonSimulationWhereInput[];
    date?: Prisma.DateTimeFilter<"AnonSimulation"> | Date | string;
    progression?: Prisma.FloatFilter<"AnonSimulation"> | number;
    model?: Prisma.StringFilter<"AnonSimulation"> | string;
    computedResults?: Prisma.JsonFilter<"AnonSimulation">;
    actionChoices?: Prisma.JsonFilter<"AnonSimulation">;
    situation?: Prisma.JsonFilter<"AnonSimulation">;
    foldedSteps?: Prisma.JsonNullableListFilter<"AnonSimulation">;
    userId?: Prisma.UuidFilter<"AnonSimulation"> | string;
    userEmail?: Prisma.StringNullableFilter<"AnonSimulation"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"AnonSimulation"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"AnonSimulation"> | Date | string;
}, "id">;
export type AnonSimulationOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    computedResults?: Prisma.SortOrder;
    actionChoices?: Prisma.SortOrder;
    situation?: Prisma.SortOrder;
    foldedSteps?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    userEmail?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.AnonSimulationCountOrderByAggregateInput;
    _avg?: Prisma.AnonSimulationAvgOrderByAggregateInput;
    _max?: Prisma.AnonSimulationMaxOrderByAggregateInput;
    _min?: Prisma.AnonSimulationMinOrderByAggregateInput;
    _sum?: Prisma.AnonSimulationSumOrderByAggregateInput;
};
export type AnonSimulationScalarWhereWithAggregatesInput = {
    AND?: Prisma.AnonSimulationScalarWhereWithAggregatesInput | Prisma.AnonSimulationScalarWhereWithAggregatesInput[];
    OR?: Prisma.AnonSimulationScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AnonSimulationScalarWhereWithAggregatesInput | Prisma.AnonSimulationScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"AnonSimulation"> | string;
    date?: Prisma.DateTimeWithAggregatesFilter<"AnonSimulation"> | Date | string;
    progression?: Prisma.FloatWithAggregatesFilter<"AnonSimulation"> | number;
    model?: Prisma.StringWithAggregatesFilter<"AnonSimulation"> | string;
    computedResults?: Prisma.JsonWithAggregatesFilter<"AnonSimulation">;
    actionChoices?: Prisma.JsonWithAggregatesFilter<"AnonSimulation">;
    situation?: Prisma.JsonWithAggregatesFilter<"AnonSimulation">;
    foldedSteps?: Prisma.JsonNullableListFilter<"AnonSimulation">;
    userId?: Prisma.UuidWithAggregatesFilter<"AnonSimulation"> | string;
    userEmail?: Prisma.StringNullableWithAggregatesFilter<"AnonSimulation"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"AnonSimulation"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"AnonSimulation"> | Date | string;
};
export type AnonSimulationCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    computedResults?: Prisma.SortOrder;
    actionChoices?: Prisma.SortOrder;
    situation?: Prisma.SortOrder;
    foldedSteps?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    userEmail?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AnonSimulationAvgOrderByAggregateInput = {
    progression?: Prisma.SortOrder;
};
export type AnonSimulationMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    userEmail?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AnonSimulationMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    progression?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    userEmail?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AnonSimulationSumOrderByAggregateInput = {
    progression?: Prisma.SortOrder;
};
export type AnonSimulationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    progression?: boolean;
    model?: boolean;
    computedResults?: boolean;
    actionChoices?: boolean;
    situation?: boolean;
    foldedSteps?: boolean;
    userId?: boolean;
    userEmail?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["anonSimulation"]>;
export type AnonSimulationSelectScalar = {
    id?: boolean;
    date?: boolean;
    progression?: boolean;
    model?: boolean;
    computedResults?: boolean;
    actionChoices?: boolean;
    situation?: boolean;
    foldedSteps?: boolean;
    userId?: boolean;
    userEmail?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type AnonSimulationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "date" | "progression" | "model" | "computedResults" | "actionChoices" | "situation" | "foldedSteps" | "userId" | "userEmail" | "createdAt" | "updatedAt", ExtArgs["result"]["anonSimulation"]>;
export type $AnonSimulationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "AnonSimulation";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        date: Date;
        progression: number;
        model: string;
        computedResults: runtime.JsonValue;
        actionChoices: runtime.JsonValue;
        situation: runtime.JsonValue;
        foldedSteps: runtime.JsonValue[];
        userId: string;
        userEmail: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["anonSimulation"]>;
    composites: {};
};
export type AnonSimulationGetPayload<S extends boolean | null | undefined | AnonSimulationDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AnonSimulationPayload, S>;
export type AnonSimulationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AnonSimulationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AnonSimulationCountAggregateInputType | true;
};
export interface AnonSimulationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['AnonSimulation'];
        meta: {
            name: 'AnonSimulation';
        };
    };
    /**
     * Find zero or one AnonSimulation that matches the filter.
     * @param {AnonSimulationFindUniqueArgs} args - Arguments to find a AnonSimulation
     * @example
     * // Get one AnonSimulation
     * const anonSimulation = await prisma.anonSimulation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnonSimulationFindUniqueArgs>(args: Prisma.SelectSubset<T, AnonSimulationFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AnonSimulationClient<runtime.Types.Result.GetResult<Prisma.$AnonSimulationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one AnonSimulation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnonSimulationFindUniqueOrThrowArgs} args - Arguments to find a AnonSimulation
     * @example
     * // Get one AnonSimulation
     * const anonSimulation = await prisma.anonSimulation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnonSimulationFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AnonSimulationFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AnonSimulationClient<runtime.Types.Result.GetResult<Prisma.$AnonSimulationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first AnonSimulation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonSimulationFindFirstArgs} args - Arguments to find a AnonSimulation
     * @example
     * // Get one AnonSimulation
     * const anonSimulation = await prisma.anonSimulation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnonSimulationFindFirstArgs>(args?: Prisma.SelectSubset<T, AnonSimulationFindFirstArgs<ExtArgs>>): Prisma.Prisma__AnonSimulationClient<runtime.Types.Result.GetResult<Prisma.$AnonSimulationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first AnonSimulation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonSimulationFindFirstOrThrowArgs} args - Arguments to find a AnonSimulation
     * @example
     * // Get one AnonSimulation
     * const anonSimulation = await prisma.anonSimulation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnonSimulationFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AnonSimulationFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AnonSimulationClient<runtime.Types.Result.GetResult<Prisma.$AnonSimulationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more AnonSimulations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonSimulationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AnonSimulations
     * const anonSimulations = await prisma.anonSimulation.findMany()
     *
     * // Get first 10 AnonSimulations
     * const anonSimulations = await prisma.anonSimulation.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const anonSimulationWithIdOnly = await prisma.anonSimulation.findMany({ select: { id: true } })
     *
     */
    findMany<T extends AnonSimulationFindManyArgs>(args?: Prisma.SelectSubset<T, AnonSimulationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AnonSimulationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Count the number of AnonSimulations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonSimulationCountArgs} args - Arguments to filter AnonSimulations to count.
     * @example
     * // Count the number of AnonSimulations
     * const count = await prisma.anonSimulation.count({
     *   where: {
     *     // ... the filter for the AnonSimulations we want to count
     *   }
     * })
    **/
    count<T extends AnonSimulationCountArgs>(args?: Prisma.Subset<T, AnonSimulationCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AnonSimulationCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a AnonSimulation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonSimulationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AnonSimulationAggregateArgs>(args: Prisma.Subset<T, AnonSimulationAggregateArgs>): Prisma.PrismaPromise<GetAnonSimulationAggregateType<T>>;
    /**
     * Group by AnonSimulation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonSimulationGroupByArgs} args - Group by arguments.
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
    groupBy<T extends AnonSimulationGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AnonSimulationGroupByArgs['orderBy'];
    } : {
        orderBy?: AnonSimulationGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AnonSimulationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnonSimulationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the AnonSimulation model
     */
    readonly fields: AnonSimulationFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for AnonSimulation.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__AnonSimulationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
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
 * Fields of the AnonSimulation model
 */
export interface AnonSimulationFieldRefs {
    readonly id: Prisma.FieldRef<"AnonSimulation", 'String'>;
    readonly date: Prisma.FieldRef<"AnonSimulation", 'DateTime'>;
    readonly progression: Prisma.FieldRef<"AnonSimulation", 'Float'>;
    readonly model: Prisma.FieldRef<"AnonSimulation", 'String'>;
    readonly computedResults: Prisma.FieldRef<"AnonSimulation", 'Json'>;
    readonly actionChoices: Prisma.FieldRef<"AnonSimulation", 'Json'>;
    readonly situation: Prisma.FieldRef<"AnonSimulation", 'Json'>;
    readonly foldedSteps: Prisma.FieldRef<"AnonSimulation", 'Json[]'>;
    readonly userId: Prisma.FieldRef<"AnonSimulation", 'String'>;
    readonly userEmail: Prisma.FieldRef<"AnonSimulation", 'String'>;
    readonly createdAt: Prisma.FieldRef<"AnonSimulation", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"AnonSimulation", 'DateTime'>;
}
/**
 * AnonSimulation findUnique
 */
export type AnonSimulationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonSimulation
     */
    select?: Prisma.AnonSimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonSimulation
     */
    omit?: Prisma.AnonSimulationOmit<ExtArgs> | null;
    /**
     * Filter, which AnonSimulation to fetch.
     */
    where: Prisma.AnonSimulationWhereUniqueInput;
};
/**
 * AnonSimulation findUniqueOrThrow
 */
export type AnonSimulationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonSimulation
     */
    select?: Prisma.AnonSimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonSimulation
     */
    omit?: Prisma.AnonSimulationOmit<ExtArgs> | null;
    /**
     * Filter, which AnonSimulation to fetch.
     */
    where: Prisma.AnonSimulationWhereUniqueInput;
};
/**
 * AnonSimulation findFirst
 */
export type AnonSimulationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonSimulation
     */
    select?: Prisma.AnonSimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonSimulation
     */
    omit?: Prisma.AnonSimulationOmit<ExtArgs> | null;
    /**
     * Filter, which AnonSimulation to fetch.
     */
    where?: Prisma.AnonSimulationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnonSimulations to fetch.
     */
    orderBy?: Prisma.AnonSimulationOrderByWithRelationInput | Prisma.AnonSimulationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AnonSimulations.
     */
    cursor?: Prisma.AnonSimulationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnonSimulations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnonSimulations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AnonSimulations.
     */
    distinct?: Prisma.AnonSimulationScalarFieldEnum | Prisma.AnonSimulationScalarFieldEnum[];
};
/**
 * AnonSimulation findFirstOrThrow
 */
export type AnonSimulationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonSimulation
     */
    select?: Prisma.AnonSimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonSimulation
     */
    omit?: Prisma.AnonSimulationOmit<ExtArgs> | null;
    /**
     * Filter, which AnonSimulation to fetch.
     */
    where?: Prisma.AnonSimulationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnonSimulations to fetch.
     */
    orderBy?: Prisma.AnonSimulationOrderByWithRelationInput | Prisma.AnonSimulationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AnonSimulations.
     */
    cursor?: Prisma.AnonSimulationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnonSimulations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnonSimulations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AnonSimulations.
     */
    distinct?: Prisma.AnonSimulationScalarFieldEnum | Prisma.AnonSimulationScalarFieldEnum[];
};
/**
 * AnonSimulation findMany
 */
export type AnonSimulationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonSimulation
     */
    select?: Prisma.AnonSimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonSimulation
     */
    omit?: Prisma.AnonSimulationOmit<ExtArgs> | null;
    /**
     * Filter, which AnonSimulations to fetch.
     */
    where?: Prisma.AnonSimulationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnonSimulations to fetch.
     */
    orderBy?: Prisma.AnonSimulationOrderByWithRelationInput | Prisma.AnonSimulationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing AnonSimulations.
     */
    cursor?: Prisma.AnonSimulationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnonSimulations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnonSimulations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AnonSimulations.
     */
    distinct?: Prisma.AnonSimulationScalarFieldEnum | Prisma.AnonSimulationScalarFieldEnum[];
};
/**
 * AnonSimulation without action
 */
export type AnonSimulationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonSimulation
     */
    select?: Prisma.AnonSimulationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonSimulation
     */
    omit?: Prisma.AnonSimulationOmit<ExtArgs> | null;
};
