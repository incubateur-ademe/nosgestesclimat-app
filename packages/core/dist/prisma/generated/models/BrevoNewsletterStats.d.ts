import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.ts";
/**
 * Model BrevoNewsletterStats
 *
 */
export type BrevoNewsletterStatsModel = runtime.Types.Result.DefaultSelection<Prisma.$BrevoNewsletterStatsPayload>;
export type AggregateBrevoNewsletterStats = {
    _count: BrevoNewsletterStatsCountAggregateOutputType | null;
    _avg: BrevoNewsletterStatsAvgAggregateOutputType | null;
    _sum: BrevoNewsletterStatsSumAggregateOutputType | null;
    _min: BrevoNewsletterStatsMinAggregateOutputType | null;
    _max: BrevoNewsletterStatsMaxAggregateOutputType | null;
};
export type BrevoNewsletterStatsAvgAggregateOutputType = {
    newsletter: number | null;
    subscriptions: number | null;
};
export type BrevoNewsletterStatsSumAggregateOutputType = {
    newsletter: number | null;
    subscriptions: number | null;
};
export type BrevoNewsletterStatsMinAggregateOutputType = {
    id: string | null;
    date: Date | null;
    newsletter: number | null;
    subscriptions: number | null;
};
export type BrevoNewsletterStatsMaxAggregateOutputType = {
    id: string | null;
    date: Date | null;
    newsletter: number | null;
    subscriptions: number | null;
};
export type BrevoNewsletterStatsCountAggregateOutputType = {
    id: number;
    date: number;
    newsletter: number;
    subscriptions: number;
    _all: number;
};
export type BrevoNewsletterStatsAvgAggregateInputType = {
    newsletter?: true;
    subscriptions?: true;
};
export type BrevoNewsletterStatsSumAggregateInputType = {
    newsletter?: true;
    subscriptions?: true;
};
export type BrevoNewsletterStatsMinAggregateInputType = {
    id?: true;
    date?: true;
    newsletter?: true;
    subscriptions?: true;
};
export type BrevoNewsletterStatsMaxAggregateInputType = {
    id?: true;
    date?: true;
    newsletter?: true;
    subscriptions?: true;
};
export type BrevoNewsletterStatsCountAggregateInputType = {
    id?: true;
    date?: true;
    newsletter?: true;
    subscriptions?: true;
    _all?: true;
};
export type BrevoNewsletterStatsAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which BrevoNewsletterStats to aggregate.
     */
    where?: Prisma.BrevoNewsletterStatsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BrevoNewsletterStats to fetch.
     */
    orderBy?: Prisma.BrevoNewsletterStatsOrderByWithRelationInput | Prisma.BrevoNewsletterStatsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.BrevoNewsletterStatsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BrevoNewsletterStats from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BrevoNewsletterStats.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned BrevoNewsletterStats
    **/
    _count?: true | BrevoNewsletterStatsCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: BrevoNewsletterStatsAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: BrevoNewsletterStatsSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: BrevoNewsletterStatsMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: BrevoNewsletterStatsMaxAggregateInputType;
};
export type GetBrevoNewsletterStatsAggregateType<T extends BrevoNewsletterStatsAggregateArgs> = {
    [P in keyof T & keyof AggregateBrevoNewsletterStats]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateBrevoNewsletterStats[P]> : Prisma.GetScalarType<T[P], AggregateBrevoNewsletterStats[P]>;
};
export type BrevoNewsletterStatsGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BrevoNewsletterStatsWhereInput;
    orderBy?: Prisma.BrevoNewsletterStatsOrderByWithAggregationInput | Prisma.BrevoNewsletterStatsOrderByWithAggregationInput[];
    by: Prisma.BrevoNewsletterStatsScalarFieldEnum[] | Prisma.BrevoNewsletterStatsScalarFieldEnum;
    having?: Prisma.BrevoNewsletterStatsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: BrevoNewsletterStatsCountAggregateInputType | true;
    _avg?: BrevoNewsletterStatsAvgAggregateInputType;
    _sum?: BrevoNewsletterStatsSumAggregateInputType;
    _min?: BrevoNewsletterStatsMinAggregateInputType;
    _max?: BrevoNewsletterStatsMaxAggregateInputType;
};
export type BrevoNewsletterStatsGroupByOutputType = {
    id: string;
    date: Date;
    newsletter: number;
    subscriptions: number;
    _count: BrevoNewsletterStatsCountAggregateOutputType | null;
    _avg: BrevoNewsletterStatsAvgAggregateOutputType | null;
    _sum: BrevoNewsletterStatsSumAggregateOutputType | null;
    _min: BrevoNewsletterStatsMinAggregateOutputType | null;
    _max: BrevoNewsletterStatsMaxAggregateOutputType | null;
};
export type GetBrevoNewsletterStatsGroupByPayload<T extends BrevoNewsletterStatsGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<BrevoNewsletterStatsGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof BrevoNewsletterStatsGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], BrevoNewsletterStatsGroupByOutputType[P]> : Prisma.GetScalarType<T[P], BrevoNewsletterStatsGroupByOutputType[P]>;
}>>;
export type BrevoNewsletterStatsWhereInput = {
    AND?: Prisma.BrevoNewsletterStatsWhereInput | Prisma.BrevoNewsletterStatsWhereInput[];
    OR?: Prisma.BrevoNewsletterStatsWhereInput[];
    NOT?: Prisma.BrevoNewsletterStatsWhereInput | Prisma.BrevoNewsletterStatsWhereInput[];
    id?: Prisma.UuidFilter<"BrevoNewsletterStats"> | string;
    date?: Prisma.DateTimeFilter<"BrevoNewsletterStats"> | Date | string;
    newsletter?: Prisma.IntFilter<"BrevoNewsletterStats"> | number;
    subscriptions?: Prisma.IntFilter<"BrevoNewsletterStats"> | number;
};
export type BrevoNewsletterStatsOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    newsletter?: Prisma.SortOrder;
    subscriptions?: Prisma.SortOrder;
};
export type BrevoNewsletterStatsWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    date_newsletter?: Prisma.BrevoNewsletterStatsDateNewsletterCompoundUniqueInput;
    AND?: Prisma.BrevoNewsletterStatsWhereInput | Prisma.BrevoNewsletterStatsWhereInput[];
    OR?: Prisma.BrevoNewsletterStatsWhereInput[];
    NOT?: Prisma.BrevoNewsletterStatsWhereInput | Prisma.BrevoNewsletterStatsWhereInput[];
    date?: Prisma.DateTimeFilter<"BrevoNewsletterStats"> | Date | string;
    newsletter?: Prisma.IntFilter<"BrevoNewsletterStats"> | number;
    subscriptions?: Prisma.IntFilter<"BrevoNewsletterStats"> | number;
}, "id" | "date_newsletter">;
export type BrevoNewsletterStatsOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    newsletter?: Prisma.SortOrder;
    subscriptions?: Prisma.SortOrder;
    _count?: Prisma.BrevoNewsletterStatsCountOrderByAggregateInput;
    _avg?: Prisma.BrevoNewsletterStatsAvgOrderByAggregateInput;
    _max?: Prisma.BrevoNewsletterStatsMaxOrderByAggregateInput;
    _min?: Prisma.BrevoNewsletterStatsMinOrderByAggregateInput;
    _sum?: Prisma.BrevoNewsletterStatsSumOrderByAggregateInput;
};
export type BrevoNewsletterStatsScalarWhereWithAggregatesInput = {
    AND?: Prisma.BrevoNewsletterStatsScalarWhereWithAggregatesInput | Prisma.BrevoNewsletterStatsScalarWhereWithAggregatesInput[];
    OR?: Prisma.BrevoNewsletterStatsScalarWhereWithAggregatesInput[];
    NOT?: Prisma.BrevoNewsletterStatsScalarWhereWithAggregatesInput | Prisma.BrevoNewsletterStatsScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"BrevoNewsletterStats"> | string;
    date?: Prisma.DateTimeWithAggregatesFilter<"BrevoNewsletterStats"> | Date | string;
    newsletter?: Prisma.IntWithAggregatesFilter<"BrevoNewsletterStats"> | number;
    subscriptions?: Prisma.IntWithAggregatesFilter<"BrevoNewsletterStats"> | number;
};
export type BrevoNewsletterStatsCreateInput = {
    id?: string;
    date: Date | string;
    newsletter: number;
    subscriptions: number;
};
export type BrevoNewsletterStatsUncheckedCreateInput = {
    id?: string;
    date: Date | string;
    newsletter: number;
    subscriptions: number;
};
export type BrevoNewsletterStatsUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    newsletter?: Prisma.IntFieldUpdateOperationsInput | number;
    subscriptions?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type BrevoNewsletterStatsUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    newsletter?: Prisma.IntFieldUpdateOperationsInput | number;
    subscriptions?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type BrevoNewsletterStatsCreateManyInput = {
    id?: string;
    date: Date | string;
    newsletter: number;
    subscriptions: number;
};
export type BrevoNewsletterStatsUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    newsletter?: Prisma.IntFieldUpdateOperationsInput | number;
    subscriptions?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type BrevoNewsletterStatsUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    newsletter?: Prisma.IntFieldUpdateOperationsInput | number;
    subscriptions?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type BrevoNewsletterStatsDateNewsletterCompoundUniqueInput = {
    date: Date | string;
    newsletter: number;
};
export type BrevoNewsletterStatsCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    newsletter?: Prisma.SortOrder;
    subscriptions?: Prisma.SortOrder;
};
export type BrevoNewsletterStatsAvgOrderByAggregateInput = {
    newsletter?: Prisma.SortOrder;
    subscriptions?: Prisma.SortOrder;
};
export type BrevoNewsletterStatsMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    newsletter?: Prisma.SortOrder;
    subscriptions?: Prisma.SortOrder;
};
export type BrevoNewsletterStatsMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    newsletter?: Prisma.SortOrder;
    subscriptions?: Prisma.SortOrder;
};
export type BrevoNewsletterStatsSumOrderByAggregateInput = {
    newsletter?: Prisma.SortOrder;
    subscriptions?: Prisma.SortOrder;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type BrevoNewsletterStatsSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    newsletter?: boolean;
    subscriptions?: boolean;
}, ExtArgs["result"]["brevoNewsletterStats"]>;
export type BrevoNewsletterStatsSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    newsletter?: boolean;
    subscriptions?: boolean;
}, ExtArgs["result"]["brevoNewsletterStats"]>;
export type BrevoNewsletterStatsSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    newsletter?: boolean;
    subscriptions?: boolean;
}, ExtArgs["result"]["brevoNewsletterStats"]>;
export type BrevoNewsletterStatsSelectScalar = {
    id?: boolean;
    date?: boolean;
    newsletter?: boolean;
    subscriptions?: boolean;
};
export type BrevoNewsletterStatsOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "date" | "newsletter" | "subscriptions", ExtArgs["result"]["brevoNewsletterStats"]>;
export type $BrevoNewsletterStatsPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "BrevoNewsletterStats";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        date: Date;
        newsletter: number;
        subscriptions: number;
    }, ExtArgs["result"]["brevoNewsletterStats"]>;
    composites: {};
};
export type BrevoNewsletterStatsGetPayload<S extends boolean | null | undefined | BrevoNewsletterStatsDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$BrevoNewsletterStatsPayload, S>;
export type BrevoNewsletterStatsCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<BrevoNewsletterStatsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: BrevoNewsletterStatsCountAggregateInputType | true;
};
export interface BrevoNewsletterStatsDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['BrevoNewsletterStats'];
        meta: {
            name: 'BrevoNewsletterStats';
        };
    };
    /**
     * Find zero or one BrevoNewsletterStats that matches the filter.
     * @param {BrevoNewsletterStatsFindUniqueArgs} args - Arguments to find a BrevoNewsletterStats
     * @example
     * // Get one BrevoNewsletterStats
     * const brevoNewsletterStats = await prisma.brevoNewsletterStats.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BrevoNewsletterStatsFindUniqueArgs>(args: Prisma.SelectSubset<T, BrevoNewsletterStatsFindUniqueArgs<ExtArgs>>): Prisma.Prisma__BrevoNewsletterStatsClient<runtime.Types.Result.GetResult<Prisma.$BrevoNewsletterStatsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one BrevoNewsletterStats that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BrevoNewsletterStatsFindUniqueOrThrowArgs} args - Arguments to find a BrevoNewsletterStats
     * @example
     * // Get one BrevoNewsletterStats
     * const brevoNewsletterStats = await prisma.brevoNewsletterStats.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BrevoNewsletterStatsFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, BrevoNewsletterStatsFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__BrevoNewsletterStatsClient<runtime.Types.Result.GetResult<Prisma.$BrevoNewsletterStatsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first BrevoNewsletterStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrevoNewsletterStatsFindFirstArgs} args - Arguments to find a BrevoNewsletterStats
     * @example
     * // Get one BrevoNewsletterStats
     * const brevoNewsletterStats = await prisma.brevoNewsletterStats.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BrevoNewsletterStatsFindFirstArgs>(args?: Prisma.SelectSubset<T, BrevoNewsletterStatsFindFirstArgs<ExtArgs>>): Prisma.Prisma__BrevoNewsletterStatsClient<runtime.Types.Result.GetResult<Prisma.$BrevoNewsletterStatsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first BrevoNewsletterStats that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrevoNewsletterStatsFindFirstOrThrowArgs} args - Arguments to find a BrevoNewsletterStats
     * @example
     * // Get one BrevoNewsletterStats
     * const brevoNewsletterStats = await prisma.brevoNewsletterStats.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BrevoNewsletterStatsFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, BrevoNewsletterStatsFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__BrevoNewsletterStatsClient<runtime.Types.Result.GetResult<Prisma.$BrevoNewsletterStatsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more BrevoNewsletterStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrevoNewsletterStatsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BrevoNewsletterStats
     * const brevoNewsletterStats = await prisma.brevoNewsletterStats.findMany()
     *
     * // Get first 10 BrevoNewsletterStats
     * const brevoNewsletterStats = await prisma.brevoNewsletterStats.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const brevoNewsletterStatsWithIdOnly = await prisma.brevoNewsletterStats.findMany({ select: { id: true } })
     *
     */
    findMany<T extends BrevoNewsletterStatsFindManyArgs>(args?: Prisma.SelectSubset<T, BrevoNewsletterStatsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BrevoNewsletterStatsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a BrevoNewsletterStats.
     * @param {BrevoNewsletterStatsCreateArgs} args - Arguments to create a BrevoNewsletterStats.
     * @example
     * // Create one BrevoNewsletterStats
     * const BrevoNewsletterStats = await prisma.brevoNewsletterStats.create({
     *   data: {
     *     // ... data to create a BrevoNewsletterStats
     *   }
     * })
     *
     */
    create<T extends BrevoNewsletterStatsCreateArgs>(args: Prisma.SelectSubset<T, BrevoNewsletterStatsCreateArgs<ExtArgs>>): Prisma.Prisma__BrevoNewsletterStatsClient<runtime.Types.Result.GetResult<Prisma.$BrevoNewsletterStatsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many BrevoNewsletterStats.
     * @param {BrevoNewsletterStatsCreateManyArgs} args - Arguments to create many BrevoNewsletterStats.
     * @example
     * // Create many BrevoNewsletterStats
     * const brevoNewsletterStats = await prisma.brevoNewsletterStats.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends BrevoNewsletterStatsCreateManyArgs>(args?: Prisma.SelectSubset<T, BrevoNewsletterStatsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many BrevoNewsletterStats and returns the data saved in the database.
     * @param {BrevoNewsletterStatsCreateManyAndReturnArgs} args - Arguments to create many BrevoNewsletterStats.
     * @example
     * // Create many BrevoNewsletterStats
     * const brevoNewsletterStats = await prisma.brevoNewsletterStats.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many BrevoNewsletterStats and only return the `id`
     * const brevoNewsletterStatsWithIdOnly = await prisma.brevoNewsletterStats.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends BrevoNewsletterStatsCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, BrevoNewsletterStatsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BrevoNewsletterStatsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a BrevoNewsletterStats.
     * @param {BrevoNewsletterStatsDeleteArgs} args - Arguments to delete one BrevoNewsletterStats.
     * @example
     * // Delete one BrevoNewsletterStats
     * const BrevoNewsletterStats = await prisma.brevoNewsletterStats.delete({
     *   where: {
     *     // ... filter to delete one BrevoNewsletterStats
     *   }
     * })
     *
     */
    delete<T extends BrevoNewsletterStatsDeleteArgs>(args: Prisma.SelectSubset<T, BrevoNewsletterStatsDeleteArgs<ExtArgs>>): Prisma.Prisma__BrevoNewsletterStatsClient<runtime.Types.Result.GetResult<Prisma.$BrevoNewsletterStatsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one BrevoNewsletterStats.
     * @param {BrevoNewsletterStatsUpdateArgs} args - Arguments to update one BrevoNewsletterStats.
     * @example
     * // Update one BrevoNewsletterStats
     * const brevoNewsletterStats = await prisma.brevoNewsletterStats.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends BrevoNewsletterStatsUpdateArgs>(args: Prisma.SelectSubset<T, BrevoNewsletterStatsUpdateArgs<ExtArgs>>): Prisma.Prisma__BrevoNewsletterStatsClient<runtime.Types.Result.GetResult<Prisma.$BrevoNewsletterStatsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more BrevoNewsletterStats.
     * @param {BrevoNewsletterStatsDeleteManyArgs} args - Arguments to filter BrevoNewsletterStats to delete.
     * @example
     * // Delete a few BrevoNewsletterStats
     * const { count } = await prisma.brevoNewsletterStats.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends BrevoNewsletterStatsDeleteManyArgs>(args?: Prisma.SelectSubset<T, BrevoNewsletterStatsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more BrevoNewsletterStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrevoNewsletterStatsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BrevoNewsletterStats
     * const brevoNewsletterStats = await prisma.brevoNewsletterStats.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends BrevoNewsletterStatsUpdateManyArgs>(args: Prisma.SelectSubset<T, BrevoNewsletterStatsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more BrevoNewsletterStats and returns the data updated in the database.
     * @param {BrevoNewsletterStatsUpdateManyAndReturnArgs} args - Arguments to update many BrevoNewsletterStats.
     * @example
     * // Update many BrevoNewsletterStats
     * const brevoNewsletterStats = await prisma.brevoNewsletterStats.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more BrevoNewsletterStats and only return the `id`
     * const brevoNewsletterStatsWithIdOnly = await prisma.brevoNewsletterStats.updateManyAndReturn({
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
    updateManyAndReturn<T extends BrevoNewsletterStatsUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, BrevoNewsletterStatsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BrevoNewsletterStatsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one BrevoNewsletterStats.
     * @param {BrevoNewsletterStatsUpsertArgs} args - Arguments to update or create a BrevoNewsletterStats.
     * @example
     * // Update or create a BrevoNewsletterStats
     * const brevoNewsletterStats = await prisma.brevoNewsletterStats.upsert({
     *   create: {
     *     // ... data to create a BrevoNewsletterStats
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BrevoNewsletterStats we want to update
     *   }
     * })
     */
    upsert<T extends BrevoNewsletterStatsUpsertArgs>(args: Prisma.SelectSubset<T, BrevoNewsletterStatsUpsertArgs<ExtArgs>>): Prisma.Prisma__BrevoNewsletterStatsClient<runtime.Types.Result.GetResult<Prisma.$BrevoNewsletterStatsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of BrevoNewsletterStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrevoNewsletterStatsCountArgs} args - Arguments to filter BrevoNewsletterStats to count.
     * @example
     * // Count the number of BrevoNewsletterStats
     * const count = await prisma.brevoNewsletterStats.count({
     *   where: {
     *     // ... the filter for the BrevoNewsletterStats we want to count
     *   }
     * })
    **/
    count<T extends BrevoNewsletterStatsCountArgs>(args?: Prisma.Subset<T, BrevoNewsletterStatsCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], BrevoNewsletterStatsCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a BrevoNewsletterStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrevoNewsletterStatsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends BrevoNewsletterStatsAggregateArgs>(args: Prisma.Subset<T, BrevoNewsletterStatsAggregateArgs>): Prisma.PrismaPromise<GetBrevoNewsletterStatsAggregateType<T>>;
    /**
     * Group by BrevoNewsletterStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrevoNewsletterStatsGroupByArgs} args - Group by arguments.
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
    groupBy<T extends BrevoNewsletterStatsGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: BrevoNewsletterStatsGroupByArgs['orderBy'];
    } : {
        orderBy?: BrevoNewsletterStatsGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, BrevoNewsletterStatsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBrevoNewsletterStatsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the BrevoNewsletterStats model
     */
    readonly fields: BrevoNewsletterStatsFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for BrevoNewsletterStats.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__BrevoNewsletterStatsClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the BrevoNewsletterStats model
 */
export interface BrevoNewsletterStatsFieldRefs {
    readonly id: Prisma.FieldRef<"BrevoNewsletterStats", 'String'>;
    readonly date: Prisma.FieldRef<"BrevoNewsletterStats", 'DateTime'>;
    readonly newsletter: Prisma.FieldRef<"BrevoNewsletterStats", 'Int'>;
    readonly subscriptions: Prisma.FieldRef<"BrevoNewsletterStats", 'Int'>;
}
/**
 * BrevoNewsletterStats findUnique
 */
export type BrevoNewsletterStatsFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrevoNewsletterStats
     */
    select?: Prisma.BrevoNewsletterStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BrevoNewsletterStats
     */
    omit?: Prisma.BrevoNewsletterStatsOmit<ExtArgs> | null;
    /**
     * Filter, which BrevoNewsletterStats to fetch.
     */
    where: Prisma.BrevoNewsletterStatsWhereUniqueInput;
};
/**
 * BrevoNewsletterStats findUniqueOrThrow
 */
export type BrevoNewsletterStatsFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrevoNewsletterStats
     */
    select?: Prisma.BrevoNewsletterStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BrevoNewsletterStats
     */
    omit?: Prisma.BrevoNewsletterStatsOmit<ExtArgs> | null;
    /**
     * Filter, which BrevoNewsletterStats to fetch.
     */
    where: Prisma.BrevoNewsletterStatsWhereUniqueInput;
};
/**
 * BrevoNewsletterStats findFirst
 */
export type BrevoNewsletterStatsFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrevoNewsletterStats
     */
    select?: Prisma.BrevoNewsletterStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BrevoNewsletterStats
     */
    omit?: Prisma.BrevoNewsletterStatsOmit<ExtArgs> | null;
    /**
     * Filter, which BrevoNewsletterStats to fetch.
     */
    where?: Prisma.BrevoNewsletterStatsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BrevoNewsletterStats to fetch.
     */
    orderBy?: Prisma.BrevoNewsletterStatsOrderByWithRelationInput | Prisma.BrevoNewsletterStatsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for BrevoNewsletterStats.
     */
    cursor?: Prisma.BrevoNewsletterStatsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BrevoNewsletterStats from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BrevoNewsletterStats.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of BrevoNewsletterStats.
     */
    distinct?: Prisma.BrevoNewsletterStatsScalarFieldEnum | Prisma.BrevoNewsletterStatsScalarFieldEnum[];
};
/**
 * BrevoNewsletterStats findFirstOrThrow
 */
export type BrevoNewsletterStatsFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrevoNewsletterStats
     */
    select?: Prisma.BrevoNewsletterStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BrevoNewsletterStats
     */
    omit?: Prisma.BrevoNewsletterStatsOmit<ExtArgs> | null;
    /**
     * Filter, which BrevoNewsletterStats to fetch.
     */
    where?: Prisma.BrevoNewsletterStatsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BrevoNewsletterStats to fetch.
     */
    orderBy?: Prisma.BrevoNewsletterStatsOrderByWithRelationInput | Prisma.BrevoNewsletterStatsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for BrevoNewsletterStats.
     */
    cursor?: Prisma.BrevoNewsletterStatsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BrevoNewsletterStats from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BrevoNewsletterStats.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of BrevoNewsletterStats.
     */
    distinct?: Prisma.BrevoNewsletterStatsScalarFieldEnum | Prisma.BrevoNewsletterStatsScalarFieldEnum[];
};
/**
 * BrevoNewsletterStats findMany
 */
export type BrevoNewsletterStatsFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrevoNewsletterStats
     */
    select?: Prisma.BrevoNewsletterStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BrevoNewsletterStats
     */
    omit?: Prisma.BrevoNewsletterStatsOmit<ExtArgs> | null;
    /**
     * Filter, which BrevoNewsletterStats to fetch.
     */
    where?: Prisma.BrevoNewsletterStatsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BrevoNewsletterStats to fetch.
     */
    orderBy?: Prisma.BrevoNewsletterStatsOrderByWithRelationInput | Prisma.BrevoNewsletterStatsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing BrevoNewsletterStats.
     */
    cursor?: Prisma.BrevoNewsletterStatsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BrevoNewsletterStats from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BrevoNewsletterStats.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of BrevoNewsletterStats.
     */
    distinct?: Prisma.BrevoNewsletterStatsScalarFieldEnum | Prisma.BrevoNewsletterStatsScalarFieldEnum[];
};
/**
 * BrevoNewsletterStats create
 */
export type BrevoNewsletterStatsCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrevoNewsletterStats
     */
    select?: Prisma.BrevoNewsletterStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BrevoNewsletterStats
     */
    omit?: Prisma.BrevoNewsletterStatsOmit<ExtArgs> | null;
    /**
     * The data needed to create a BrevoNewsletterStats.
     */
    data: Prisma.XOR<Prisma.BrevoNewsletterStatsCreateInput, Prisma.BrevoNewsletterStatsUncheckedCreateInput>;
};
/**
 * BrevoNewsletterStats createMany
 */
export type BrevoNewsletterStatsCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many BrevoNewsletterStats.
     */
    data: Prisma.BrevoNewsletterStatsCreateManyInput | Prisma.BrevoNewsletterStatsCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * BrevoNewsletterStats createManyAndReturn
 */
export type BrevoNewsletterStatsCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrevoNewsletterStats
     */
    select?: Prisma.BrevoNewsletterStatsSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the BrevoNewsletterStats
     */
    omit?: Prisma.BrevoNewsletterStatsOmit<ExtArgs> | null;
    /**
     * The data used to create many BrevoNewsletterStats.
     */
    data: Prisma.BrevoNewsletterStatsCreateManyInput | Prisma.BrevoNewsletterStatsCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * BrevoNewsletterStats update
 */
export type BrevoNewsletterStatsUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrevoNewsletterStats
     */
    select?: Prisma.BrevoNewsletterStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BrevoNewsletterStats
     */
    omit?: Prisma.BrevoNewsletterStatsOmit<ExtArgs> | null;
    /**
     * The data needed to update a BrevoNewsletterStats.
     */
    data: Prisma.XOR<Prisma.BrevoNewsletterStatsUpdateInput, Prisma.BrevoNewsletterStatsUncheckedUpdateInput>;
    /**
     * Choose, which BrevoNewsletterStats to update.
     */
    where: Prisma.BrevoNewsletterStatsWhereUniqueInput;
};
/**
 * BrevoNewsletterStats updateMany
 */
export type BrevoNewsletterStatsUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update BrevoNewsletterStats.
     */
    data: Prisma.XOR<Prisma.BrevoNewsletterStatsUpdateManyMutationInput, Prisma.BrevoNewsletterStatsUncheckedUpdateManyInput>;
    /**
     * Filter which BrevoNewsletterStats to update
     */
    where?: Prisma.BrevoNewsletterStatsWhereInput;
    /**
     * Limit how many BrevoNewsletterStats to update.
     */
    limit?: number;
};
/**
 * BrevoNewsletterStats updateManyAndReturn
 */
export type BrevoNewsletterStatsUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrevoNewsletterStats
     */
    select?: Prisma.BrevoNewsletterStatsSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the BrevoNewsletterStats
     */
    omit?: Prisma.BrevoNewsletterStatsOmit<ExtArgs> | null;
    /**
     * The data used to update BrevoNewsletterStats.
     */
    data: Prisma.XOR<Prisma.BrevoNewsletterStatsUpdateManyMutationInput, Prisma.BrevoNewsletterStatsUncheckedUpdateManyInput>;
    /**
     * Filter which BrevoNewsletterStats to update
     */
    where?: Prisma.BrevoNewsletterStatsWhereInput;
    /**
     * Limit how many BrevoNewsletterStats to update.
     */
    limit?: number;
};
/**
 * BrevoNewsletterStats upsert
 */
export type BrevoNewsletterStatsUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrevoNewsletterStats
     */
    select?: Prisma.BrevoNewsletterStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BrevoNewsletterStats
     */
    omit?: Prisma.BrevoNewsletterStatsOmit<ExtArgs> | null;
    /**
     * The filter to search for the BrevoNewsletterStats to update in case it exists.
     */
    where: Prisma.BrevoNewsletterStatsWhereUniqueInput;
    /**
     * In case the BrevoNewsletterStats found by the `where` argument doesn't exist, create a new BrevoNewsletterStats with this data.
     */
    create: Prisma.XOR<Prisma.BrevoNewsletterStatsCreateInput, Prisma.BrevoNewsletterStatsUncheckedCreateInput>;
    /**
     * In case the BrevoNewsletterStats was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.BrevoNewsletterStatsUpdateInput, Prisma.BrevoNewsletterStatsUncheckedUpdateInput>;
};
/**
 * BrevoNewsletterStats delete
 */
export type BrevoNewsletterStatsDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrevoNewsletterStats
     */
    select?: Prisma.BrevoNewsletterStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BrevoNewsletterStats
     */
    omit?: Prisma.BrevoNewsletterStatsOmit<ExtArgs> | null;
    /**
     * Filter which BrevoNewsletterStats to delete.
     */
    where: Prisma.BrevoNewsletterStatsWhereUniqueInput;
};
/**
 * BrevoNewsletterStats deleteMany
 */
export type BrevoNewsletterStatsDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which BrevoNewsletterStats to delete
     */
    where?: Prisma.BrevoNewsletterStatsWhereInput;
    /**
     * Limit how many BrevoNewsletterStats to delete.
     */
    limit?: number;
};
/**
 * BrevoNewsletterStats without action
 */
export type BrevoNewsletterStatsDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrevoNewsletterStats
     */
    select?: Prisma.BrevoNewsletterStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BrevoNewsletterStats
     */
    omit?: Prisma.BrevoNewsletterStatsOmit<ExtArgs> | null;
};
