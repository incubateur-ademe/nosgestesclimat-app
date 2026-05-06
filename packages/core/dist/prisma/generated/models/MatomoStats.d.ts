import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.ts";
import type * as Prisma from "../internal/prismaNamespace.ts";
/**
 * Model MatomoStats
 *
 */
export type MatomoStatsModel = runtime.Types.Result.DefaultSelection<Prisma.$MatomoStatsPayload>;
export type AggregateMatomoStats = {
    _count: MatomoStatsCountAggregateOutputType | null;
    _avg: MatomoStatsAvgAggregateOutputType | null;
    _sum: MatomoStatsSumAggregateOutputType | null;
    _min: MatomoStatsMinAggregateOutputType | null;
    _max: MatomoStatsMaxAggregateOutputType | null;
};
export type MatomoStatsAvgAggregateOutputType = {
    visits: number | null;
    firstAnswer: number | null;
    finishedSimulations: number | null;
};
export type MatomoStatsSumAggregateOutputType = {
    visits: number | null;
    firstAnswer: number | null;
    finishedSimulations: number | null;
};
export type MatomoStatsMinAggregateOutputType = {
    id: string | null;
    date: Date | null;
    source: $Enums.MatomoStatsSource | null;
    kind: $Enums.StatsKind | null;
    referrer: string | null;
    device: $Enums.MatomoStatsDevice | null;
    iframe: boolean | null;
    visits: number | null;
    firstAnswer: number | null;
    finishedSimulations: number | null;
};
export type MatomoStatsMaxAggregateOutputType = {
    id: string | null;
    date: Date | null;
    source: $Enums.MatomoStatsSource | null;
    kind: $Enums.StatsKind | null;
    referrer: string | null;
    device: $Enums.MatomoStatsDevice | null;
    iframe: boolean | null;
    visits: number | null;
    firstAnswer: number | null;
    finishedSimulations: number | null;
};
export type MatomoStatsCountAggregateOutputType = {
    id: number;
    date: number;
    source: number;
    kind: number;
    referrer: number;
    device: number;
    iframe: number;
    visits: number;
    firstAnswer: number;
    finishedSimulations: number;
    _all: number;
};
export type MatomoStatsAvgAggregateInputType = {
    visits?: true;
    firstAnswer?: true;
    finishedSimulations?: true;
};
export type MatomoStatsSumAggregateInputType = {
    visits?: true;
    firstAnswer?: true;
    finishedSimulations?: true;
};
export type MatomoStatsMinAggregateInputType = {
    id?: true;
    date?: true;
    source?: true;
    kind?: true;
    referrer?: true;
    device?: true;
    iframe?: true;
    visits?: true;
    firstAnswer?: true;
    finishedSimulations?: true;
};
export type MatomoStatsMaxAggregateInputType = {
    id?: true;
    date?: true;
    source?: true;
    kind?: true;
    referrer?: true;
    device?: true;
    iframe?: true;
    visits?: true;
    firstAnswer?: true;
    finishedSimulations?: true;
};
export type MatomoStatsCountAggregateInputType = {
    id?: true;
    date?: true;
    source?: true;
    kind?: true;
    referrer?: true;
    device?: true;
    iframe?: true;
    visits?: true;
    firstAnswer?: true;
    finishedSimulations?: true;
    _all?: true;
};
export type MatomoStatsAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which MatomoStats to aggregate.
     */
    where?: Prisma.MatomoStatsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MatomoStats to fetch.
     */
    orderBy?: Prisma.MatomoStatsOrderByWithRelationInput | Prisma.MatomoStatsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.MatomoStatsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MatomoStats from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MatomoStats.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned MatomoStats
    **/
    _count?: true | MatomoStatsCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: MatomoStatsAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: MatomoStatsSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: MatomoStatsMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: MatomoStatsMaxAggregateInputType;
};
export type GetMatomoStatsAggregateType<T extends MatomoStatsAggregateArgs> = {
    [P in keyof T & keyof AggregateMatomoStats]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMatomoStats[P]> : Prisma.GetScalarType<T[P], AggregateMatomoStats[P]>;
};
export type MatomoStatsGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MatomoStatsWhereInput;
    orderBy?: Prisma.MatomoStatsOrderByWithAggregationInput | Prisma.MatomoStatsOrderByWithAggregationInput[];
    by: Prisma.MatomoStatsScalarFieldEnum[] | Prisma.MatomoStatsScalarFieldEnum;
    having?: Prisma.MatomoStatsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MatomoStatsCountAggregateInputType | true;
    _avg?: MatomoStatsAvgAggregateInputType;
    _sum?: MatomoStatsSumAggregateInputType;
    _min?: MatomoStatsMinAggregateInputType;
    _max?: MatomoStatsMaxAggregateInputType;
};
export type MatomoStatsGroupByOutputType = {
    id: string;
    date: Date;
    source: $Enums.MatomoStatsSource;
    kind: $Enums.StatsKind;
    referrer: string;
    device: $Enums.MatomoStatsDevice;
    iframe: boolean;
    visits: number;
    firstAnswer: number;
    finishedSimulations: number;
    _count: MatomoStatsCountAggregateOutputType | null;
    _avg: MatomoStatsAvgAggregateOutputType | null;
    _sum: MatomoStatsSumAggregateOutputType | null;
    _min: MatomoStatsMinAggregateOutputType | null;
    _max: MatomoStatsMaxAggregateOutputType | null;
};
export type GetMatomoStatsGroupByPayload<T extends MatomoStatsGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MatomoStatsGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MatomoStatsGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MatomoStatsGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MatomoStatsGroupByOutputType[P]>;
}>>;
export type MatomoStatsWhereInput = {
    AND?: Prisma.MatomoStatsWhereInput | Prisma.MatomoStatsWhereInput[];
    OR?: Prisma.MatomoStatsWhereInput[];
    NOT?: Prisma.MatomoStatsWhereInput | Prisma.MatomoStatsWhereInput[];
    id?: Prisma.UuidFilter<"MatomoStats"> | string;
    date?: Prisma.DateTimeFilter<"MatomoStats"> | Date | string;
    source?: Prisma.EnumMatomoStatsSourceFilter<"MatomoStats"> | $Enums.MatomoStatsSource;
    kind?: Prisma.EnumStatsKindFilter<"MatomoStats"> | $Enums.StatsKind;
    referrer?: Prisma.StringFilter<"MatomoStats"> | string;
    device?: Prisma.EnumMatomoStatsDeviceFilter<"MatomoStats"> | $Enums.MatomoStatsDevice;
    iframe?: Prisma.BoolFilter<"MatomoStats"> | boolean;
    visits?: Prisma.IntFilter<"MatomoStats"> | number;
    firstAnswer?: Prisma.IntFilter<"MatomoStats"> | number;
    finishedSimulations?: Prisma.IntFilter<"MatomoStats"> | number;
};
export type MatomoStatsOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    kind?: Prisma.SortOrder;
    referrer?: Prisma.SortOrder;
    device?: Prisma.SortOrder;
    iframe?: Prisma.SortOrder;
    visits?: Prisma.SortOrder;
    firstAnswer?: Prisma.SortOrder;
    finishedSimulations?: Prisma.SortOrder;
};
export type MatomoStatsWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    date_source_kind_referrer_device_iframe?: Prisma.MatomoStatsDateSourceKindReferrerDeviceIframeCompoundUniqueInput;
    AND?: Prisma.MatomoStatsWhereInput | Prisma.MatomoStatsWhereInput[];
    OR?: Prisma.MatomoStatsWhereInput[];
    NOT?: Prisma.MatomoStatsWhereInput | Prisma.MatomoStatsWhereInput[];
    date?: Prisma.DateTimeFilter<"MatomoStats"> | Date | string;
    source?: Prisma.EnumMatomoStatsSourceFilter<"MatomoStats"> | $Enums.MatomoStatsSource;
    kind?: Prisma.EnumStatsKindFilter<"MatomoStats"> | $Enums.StatsKind;
    referrer?: Prisma.StringFilter<"MatomoStats"> | string;
    device?: Prisma.EnumMatomoStatsDeviceFilter<"MatomoStats"> | $Enums.MatomoStatsDevice;
    iframe?: Prisma.BoolFilter<"MatomoStats"> | boolean;
    visits?: Prisma.IntFilter<"MatomoStats"> | number;
    firstAnswer?: Prisma.IntFilter<"MatomoStats"> | number;
    finishedSimulations?: Prisma.IntFilter<"MatomoStats"> | number;
}, "id" | "date_source_kind_referrer_device_iframe">;
export type MatomoStatsOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    kind?: Prisma.SortOrder;
    referrer?: Prisma.SortOrder;
    device?: Prisma.SortOrder;
    iframe?: Prisma.SortOrder;
    visits?: Prisma.SortOrder;
    firstAnswer?: Prisma.SortOrder;
    finishedSimulations?: Prisma.SortOrder;
    _count?: Prisma.MatomoStatsCountOrderByAggregateInput;
    _avg?: Prisma.MatomoStatsAvgOrderByAggregateInput;
    _max?: Prisma.MatomoStatsMaxOrderByAggregateInput;
    _min?: Prisma.MatomoStatsMinOrderByAggregateInput;
    _sum?: Prisma.MatomoStatsSumOrderByAggregateInput;
};
export type MatomoStatsScalarWhereWithAggregatesInput = {
    AND?: Prisma.MatomoStatsScalarWhereWithAggregatesInput | Prisma.MatomoStatsScalarWhereWithAggregatesInput[];
    OR?: Prisma.MatomoStatsScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MatomoStatsScalarWhereWithAggregatesInput | Prisma.MatomoStatsScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"MatomoStats"> | string;
    date?: Prisma.DateTimeWithAggregatesFilter<"MatomoStats"> | Date | string;
    source?: Prisma.EnumMatomoStatsSourceWithAggregatesFilter<"MatomoStats"> | $Enums.MatomoStatsSource;
    kind?: Prisma.EnumStatsKindWithAggregatesFilter<"MatomoStats"> | $Enums.StatsKind;
    referrer?: Prisma.StringWithAggregatesFilter<"MatomoStats"> | string;
    device?: Prisma.EnumMatomoStatsDeviceWithAggregatesFilter<"MatomoStats"> | $Enums.MatomoStatsDevice;
    iframe?: Prisma.BoolWithAggregatesFilter<"MatomoStats"> | boolean;
    visits?: Prisma.IntWithAggregatesFilter<"MatomoStats"> | number;
    firstAnswer?: Prisma.IntWithAggregatesFilter<"MatomoStats"> | number;
    finishedSimulations?: Prisma.IntWithAggregatesFilter<"MatomoStats"> | number;
};
export type MatomoStatsCreateInput = {
    id?: string;
    date: Date | string;
    source: $Enums.MatomoStatsSource;
    kind: $Enums.StatsKind;
    referrer?: string;
    device: $Enums.MatomoStatsDevice;
    iframe: boolean;
    visits: number;
    firstAnswer: number;
    finishedSimulations: number;
};
export type MatomoStatsUncheckedCreateInput = {
    id?: string;
    date: Date | string;
    source: $Enums.MatomoStatsSource;
    kind: $Enums.StatsKind;
    referrer?: string;
    device: $Enums.MatomoStatsDevice;
    iframe: boolean;
    visits: number;
    firstAnswer: number;
    finishedSimulations: number;
};
export type MatomoStatsUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    source?: Prisma.EnumMatomoStatsSourceFieldUpdateOperationsInput | $Enums.MatomoStatsSource;
    kind?: Prisma.EnumStatsKindFieldUpdateOperationsInput | $Enums.StatsKind;
    referrer?: Prisma.StringFieldUpdateOperationsInput | string;
    device?: Prisma.EnumMatomoStatsDeviceFieldUpdateOperationsInput | $Enums.MatomoStatsDevice;
    iframe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    visits?: Prisma.IntFieldUpdateOperationsInput | number;
    firstAnswer?: Prisma.IntFieldUpdateOperationsInput | number;
    finishedSimulations?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type MatomoStatsUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    source?: Prisma.EnumMatomoStatsSourceFieldUpdateOperationsInput | $Enums.MatomoStatsSource;
    kind?: Prisma.EnumStatsKindFieldUpdateOperationsInput | $Enums.StatsKind;
    referrer?: Prisma.StringFieldUpdateOperationsInput | string;
    device?: Prisma.EnumMatomoStatsDeviceFieldUpdateOperationsInput | $Enums.MatomoStatsDevice;
    iframe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    visits?: Prisma.IntFieldUpdateOperationsInput | number;
    firstAnswer?: Prisma.IntFieldUpdateOperationsInput | number;
    finishedSimulations?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type MatomoStatsCreateManyInput = {
    id?: string;
    date: Date | string;
    source: $Enums.MatomoStatsSource;
    kind: $Enums.StatsKind;
    referrer?: string;
    device: $Enums.MatomoStatsDevice;
    iframe: boolean;
    visits: number;
    firstAnswer: number;
    finishedSimulations: number;
};
export type MatomoStatsUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    source?: Prisma.EnumMatomoStatsSourceFieldUpdateOperationsInput | $Enums.MatomoStatsSource;
    kind?: Prisma.EnumStatsKindFieldUpdateOperationsInput | $Enums.StatsKind;
    referrer?: Prisma.StringFieldUpdateOperationsInput | string;
    device?: Prisma.EnumMatomoStatsDeviceFieldUpdateOperationsInput | $Enums.MatomoStatsDevice;
    iframe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    visits?: Prisma.IntFieldUpdateOperationsInput | number;
    firstAnswer?: Prisma.IntFieldUpdateOperationsInput | number;
    finishedSimulations?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type MatomoStatsUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    source?: Prisma.EnumMatomoStatsSourceFieldUpdateOperationsInput | $Enums.MatomoStatsSource;
    kind?: Prisma.EnumStatsKindFieldUpdateOperationsInput | $Enums.StatsKind;
    referrer?: Prisma.StringFieldUpdateOperationsInput | string;
    device?: Prisma.EnumMatomoStatsDeviceFieldUpdateOperationsInput | $Enums.MatomoStatsDevice;
    iframe?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    visits?: Prisma.IntFieldUpdateOperationsInput | number;
    firstAnswer?: Prisma.IntFieldUpdateOperationsInput | number;
    finishedSimulations?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type MatomoStatsDateSourceKindReferrerDeviceIframeCompoundUniqueInput = {
    date: Date | string;
    source: $Enums.MatomoStatsSource;
    kind: $Enums.StatsKind;
    referrer: string;
    device: $Enums.MatomoStatsDevice;
    iframe: boolean;
};
export type MatomoStatsCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    kind?: Prisma.SortOrder;
    referrer?: Prisma.SortOrder;
    device?: Prisma.SortOrder;
    iframe?: Prisma.SortOrder;
    visits?: Prisma.SortOrder;
    firstAnswer?: Prisma.SortOrder;
    finishedSimulations?: Prisma.SortOrder;
};
export type MatomoStatsAvgOrderByAggregateInput = {
    visits?: Prisma.SortOrder;
    firstAnswer?: Prisma.SortOrder;
    finishedSimulations?: Prisma.SortOrder;
};
export type MatomoStatsMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    kind?: Prisma.SortOrder;
    referrer?: Prisma.SortOrder;
    device?: Prisma.SortOrder;
    iframe?: Prisma.SortOrder;
    visits?: Prisma.SortOrder;
    firstAnswer?: Prisma.SortOrder;
    finishedSimulations?: Prisma.SortOrder;
};
export type MatomoStatsMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    kind?: Prisma.SortOrder;
    referrer?: Prisma.SortOrder;
    device?: Prisma.SortOrder;
    iframe?: Prisma.SortOrder;
    visits?: Prisma.SortOrder;
    firstAnswer?: Prisma.SortOrder;
    finishedSimulations?: Prisma.SortOrder;
};
export type MatomoStatsSumOrderByAggregateInput = {
    visits?: Prisma.SortOrder;
    firstAnswer?: Prisma.SortOrder;
    finishedSimulations?: Prisma.SortOrder;
};
export type EnumMatomoStatsSourceFieldUpdateOperationsInput = {
    set?: $Enums.MatomoStatsSource;
};
export type EnumMatomoStatsDeviceFieldUpdateOperationsInput = {
    set?: $Enums.MatomoStatsDevice;
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type MatomoStatsSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    source?: boolean;
    kind?: boolean;
    referrer?: boolean;
    device?: boolean;
    iframe?: boolean;
    visits?: boolean;
    firstAnswer?: boolean;
    finishedSimulations?: boolean;
}, ExtArgs["result"]["matomoStats"]>;
export type MatomoStatsSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    source?: boolean;
    kind?: boolean;
    referrer?: boolean;
    device?: boolean;
    iframe?: boolean;
    visits?: boolean;
    firstAnswer?: boolean;
    finishedSimulations?: boolean;
}, ExtArgs["result"]["matomoStats"]>;
export type MatomoStatsSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    source?: boolean;
    kind?: boolean;
    referrer?: boolean;
    device?: boolean;
    iframe?: boolean;
    visits?: boolean;
    firstAnswer?: boolean;
    finishedSimulations?: boolean;
}, ExtArgs["result"]["matomoStats"]>;
export type MatomoStatsSelectScalar = {
    id?: boolean;
    date?: boolean;
    source?: boolean;
    kind?: boolean;
    referrer?: boolean;
    device?: boolean;
    iframe?: boolean;
    visits?: boolean;
    firstAnswer?: boolean;
    finishedSimulations?: boolean;
};
export type MatomoStatsOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "date" | "source" | "kind" | "referrer" | "device" | "iframe" | "visits" | "firstAnswer" | "finishedSimulations", ExtArgs["result"]["matomoStats"]>;
export type $MatomoStatsPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "MatomoStats";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        date: Date;
        source: $Enums.MatomoStatsSource;
        kind: $Enums.StatsKind;
        referrer: string;
        device: $Enums.MatomoStatsDevice;
        iframe: boolean;
        visits: number;
        firstAnswer: number;
        finishedSimulations: number;
    }, ExtArgs["result"]["matomoStats"]>;
    composites: {};
};
export type MatomoStatsGetPayload<S extends boolean | null | undefined | MatomoStatsDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MatomoStatsPayload, S>;
export type MatomoStatsCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MatomoStatsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MatomoStatsCountAggregateInputType | true;
};
export interface MatomoStatsDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['MatomoStats'];
        meta: {
            name: 'MatomoStats';
        };
    };
    /**
     * Find zero or one MatomoStats that matches the filter.
     * @param {MatomoStatsFindUniqueArgs} args - Arguments to find a MatomoStats
     * @example
     * // Get one MatomoStats
     * const matomoStats = await prisma.matomoStats.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MatomoStatsFindUniqueArgs>(args: Prisma.SelectSubset<T, MatomoStatsFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MatomoStatsClient<runtime.Types.Result.GetResult<Prisma.$MatomoStatsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one MatomoStats that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MatomoStatsFindUniqueOrThrowArgs} args - Arguments to find a MatomoStats
     * @example
     * // Get one MatomoStats
     * const matomoStats = await prisma.matomoStats.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MatomoStatsFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MatomoStatsFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MatomoStatsClient<runtime.Types.Result.GetResult<Prisma.$MatomoStatsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first MatomoStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatomoStatsFindFirstArgs} args - Arguments to find a MatomoStats
     * @example
     * // Get one MatomoStats
     * const matomoStats = await prisma.matomoStats.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MatomoStatsFindFirstArgs>(args?: Prisma.SelectSubset<T, MatomoStatsFindFirstArgs<ExtArgs>>): Prisma.Prisma__MatomoStatsClient<runtime.Types.Result.GetResult<Prisma.$MatomoStatsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first MatomoStats that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatomoStatsFindFirstOrThrowArgs} args - Arguments to find a MatomoStats
     * @example
     * // Get one MatomoStats
     * const matomoStats = await prisma.matomoStats.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MatomoStatsFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MatomoStatsFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MatomoStatsClient<runtime.Types.Result.GetResult<Prisma.$MatomoStatsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more MatomoStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatomoStatsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MatomoStats
     * const matomoStats = await prisma.matomoStats.findMany()
     *
     * // Get first 10 MatomoStats
     * const matomoStats = await prisma.matomoStats.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const matomoStatsWithIdOnly = await prisma.matomoStats.findMany({ select: { id: true } })
     *
     */
    findMany<T extends MatomoStatsFindManyArgs>(args?: Prisma.SelectSubset<T, MatomoStatsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MatomoStatsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a MatomoStats.
     * @param {MatomoStatsCreateArgs} args - Arguments to create a MatomoStats.
     * @example
     * // Create one MatomoStats
     * const MatomoStats = await prisma.matomoStats.create({
     *   data: {
     *     // ... data to create a MatomoStats
     *   }
     * })
     *
     */
    create<T extends MatomoStatsCreateArgs>(args: Prisma.SelectSubset<T, MatomoStatsCreateArgs<ExtArgs>>): Prisma.Prisma__MatomoStatsClient<runtime.Types.Result.GetResult<Prisma.$MatomoStatsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many MatomoStats.
     * @param {MatomoStatsCreateManyArgs} args - Arguments to create many MatomoStats.
     * @example
     * // Create many MatomoStats
     * const matomoStats = await prisma.matomoStats.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends MatomoStatsCreateManyArgs>(args?: Prisma.SelectSubset<T, MatomoStatsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many MatomoStats and returns the data saved in the database.
     * @param {MatomoStatsCreateManyAndReturnArgs} args - Arguments to create many MatomoStats.
     * @example
     * // Create many MatomoStats
     * const matomoStats = await prisma.matomoStats.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many MatomoStats and only return the `id`
     * const matomoStatsWithIdOnly = await prisma.matomoStats.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends MatomoStatsCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MatomoStatsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MatomoStatsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a MatomoStats.
     * @param {MatomoStatsDeleteArgs} args - Arguments to delete one MatomoStats.
     * @example
     * // Delete one MatomoStats
     * const MatomoStats = await prisma.matomoStats.delete({
     *   where: {
     *     // ... filter to delete one MatomoStats
     *   }
     * })
     *
     */
    delete<T extends MatomoStatsDeleteArgs>(args: Prisma.SelectSubset<T, MatomoStatsDeleteArgs<ExtArgs>>): Prisma.Prisma__MatomoStatsClient<runtime.Types.Result.GetResult<Prisma.$MatomoStatsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one MatomoStats.
     * @param {MatomoStatsUpdateArgs} args - Arguments to update one MatomoStats.
     * @example
     * // Update one MatomoStats
     * const matomoStats = await prisma.matomoStats.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends MatomoStatsUpdateArgs>(args: Prisma.SelectSubset<T, MatomoStatsUpdateArgs<ExtArgs>>): Prisma.Prisma__MatomoStatsClient<runtime.Types.Result.GetResult<Prisma.$MatomoStatsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more MatomoStats.
     * @param {MatomoStatsDeleteManyArgs} args - Arguments to filter MatomoStats to delete.
     * @example
     * // Delete a few MatomoStats
     * const { count } = await prisma.matomoStats.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends MatomoStatsDeleteManyArgs>(args?: Prisma.SelectSubset<T, MatomoStatsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more MatomoStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatomoStatsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MatomoStats
     * const matomoStats = await prisma.matomoStats.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends MatomoStatsUpdateManyArgs>(args: Prisma.SelectSubset<T, MatomoStatsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more MatomoStats and returns the data updated in the database.
     * @param {MatomoStatsUpdateManyAndReturnArgs} args - Arguments to update many MatomoStats.
     * @example
     * // Update many MatomoStats
     * const matomoStats = await prisma.matomoStats.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more MatomoStats and only return the `id`
     * const matomoStatsWithIdOnly = await prisma.matomoStats.updateManyAndReturn({
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
    updateManyAndReturn<T extends MatomoStatsUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MatomoStatsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MatomoStatsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one MatomoStats.
     * @param {MatomoStatsUpsertArgs} args - Arguments to update or create a MatomoStats.
     * @example
     * // Update or create a MatomoStats
     * const matomoStats = await prisma.matomoStats.upsert({
     *   create: {
     *     // ... data to create a MatomoStats
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MatomoStats we want to update
     *   }
     * })
     */
    upsert<T extends MatomoStatsUpsertArgs>(args: Prisma.SelectSubset<T, MatomoStatsUpsertArgs<ExtArgs>>): Prisma.Prisma__MatomoStatsClient<runtime.Types.Result.GetResult<Prisma.$MatomoStatsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of MatomoStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatomoStatsCountArgs} args - Arguments to filter MatomoStats to count.
     * @example
     * // Count the number of MatomoStats
     * const count = await prisma.matomoStats.count({
     *   where: {
     *     // ... the filter for the MatomoStats we want to count
     *   }
     * })
    **/
    count<T extends MatomoStatsCountArgs>(args?: Prisma.Subset<T, MatomoStatsCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MatomoStatsCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a MatomoStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatomoStatsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MatomoStatsAggregateArgs>(args: Prisma.Subset<T, MatomoStatsAggregateArgs>): Prisma.PrismaPromise<GetMatomoStatsAggregateType<T>>;
    /**
     * Group by MatomoStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MatomoStatsGroupByArgs} args - Group by arguments.
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
    groupBy<T extends MatomoStatsGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MatomoStatsGroupByArgs['orderBy'];
    } : {
        orderBy?: MatomoStatsGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MatomoStatsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMatomoStatsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the MatomoStats model
     */
    readonly fields: MatomoStatsFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for MatomoStats.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__MatomoStatsClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the MatomoStats model
 */
export interface MatomoStatsFieldRefs {
    readonly id: Prisma.FieldRef<"MatomoStats", 'String'>;
    readonly date: Prisma.FieldRef<"MatomoStats", 'DateTime'>;
    readonly source: Prisma.FieldRef<"MatomoStats", 'MatomoStatsSource'>;
    readonly kind: Prisma.FieldRef<"MatomoStats", 'StatsKind'>;
    readonly referrer: Prisma.FieldRef<"MatomoStats", 'String'>;
    readonly device: Prisma.FieldRef<"MatomoStats", 'MatomoStatsDevice'>;
    readonly iframe: Prisma.FieldRef<"MatomoStats", 'Boolean'>;
    readonly visits: Prisma.FieldRef<"MatomoStats", 'Int'>;
    readonly firstAnswer: Prisma.FieldRef<"MatomoStats", 'Int'>;
    readonly finishedSimulations: Prisma.FieldRef<"MatomoStats", 'Int'>;
}
/**
 * MatomoStats findUnique
 */
export type MatomoStatsFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatomoStats
     */
    select?: Prisma.MatomoStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MatomoStats
     */
    omit?: Prisma.MatomoStatsOmit<ExtArgs> | null;
    /**
     * Filter, which MatomoStats to fetch.
     */
    where: Prisma.MatomoStatsWhereUniqueInput;
};
/**
 * MatomoStats findUniqueOrThrow
 */
export type MatomoStatsFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatomoStats
     */
    select?: Prisma.MatomoStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MatomoStats
     */
    omit?: Prisma.MatomoStatsOmit<ExtArgs> | null;
    /**
     * Filter, which MatomoStats to fetch.
     */
    where: Prisma.MatomoStatsWhereUniqueInput;
};
/**
 * MatomoStats findFirst
 */
export type MatomoStatsFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatomoStats
     */
    select?: Prisma.MatomoStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MatomoStats
     */
    omit?: Prisma.MatomoStatsOmit<ExtArgs> | null;
    /**
     * Filter, which MatomoStats to fetch.
     */
    where?: Prisma.MatomoStatsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MatomoStats to fetch.
     */
    orderBy?: Prisma.MatomoStatsOrderByWithRelationInput | Prisma.MatomoStatsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for MatomoStats.
     */
    cursor?: Prisma.MatomoStatsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MatomoStats from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MatomoStats.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MatomoStats.
     */
    distinct?: Prisma.MatomoStatsScalarFieldEnum | Prisma.MatomoStatsScalarFieldEnum[];
};
/**
 * MatomoStats findFirstOrThrow
 */
export type MatomoStatsFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatomoStats
     */
    select?: Prisma.MatomoStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MatomoStats
     */
    omit?: Prisma.MatomoStatsOmit<ExtArgs> | null;
    /**
     * Filter, which MatomoStats to fetch.
     */
    where?: Prisma.MatomoStatsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MatomoStats to fetch.
     */
    orderBy?: Prisma.MatomoStatsOrderByWithRelationInput | Prisma.MatomoStatsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for MatomoStats.
     */
    cursor?: Prisma.MatomoStatsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MatomoStats from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MatomoStats.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MatomoStats.
     */
    distinct?: Prisma.MatomoStatsScalarFieldEnum | Prisma.MatomoStatsScalarFieldEnum[];
};
/**
 * MatomoStats findMany
 */
export type MatomoStatsFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatomoStats
     */
    select?: Prisma.MatomoStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MatomoStats
     */
    omit?: Prisma.MatomoStatsOmit<ExtArgs> | null;
    /**
     * Filter, which MatomoStats to fetch.
     */
    where?: Prisma.MatomoStatsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MatomoStats to fetch.
     */
    orderBy?: Prisma.MatomoStatsOrderByWithRelationInput | Prisma.MatomoStatsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing MatomoStats.
     */
    cursor?: Prisma.MatomoStatsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MatomoStats from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MatomoStats.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MatomoStats.
     */
    distinct?: Prisma.MatomoStatsScalarFieldEnum | Prisma.MatomoStatsScalarFieldEnum[];
};
/**
 * MatomoStats create
 */
export type MatomoStatsCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatomoStats
     */
    select?: Prisma.MatomoStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MatomoStats
     */
    omit?: Prisma.MatomoStatsOmit<ExtArgs> | null;
    /**
     * The data needed to create a MatomoStats.
     */
    data: Prisma.XOR<Prisma.MatomoStatsCreateInput, Prisma.MatomoStatsUncheckedCreateInput>;
};
/**
 * MatomoStats createMany
 */
export type MatomoStatsCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many MatomoStats.
     */
    data: Prisma.MatomoStatsCreateManyInput | Prisma.MatomoStatsCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * MatomoStats createManyAndReturn
 */
export type MatomoStatsCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatomoStats
     */
    select?: Prisma.MatomoStatsSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the MatomoStats
     */
    omit?: Prisma.MatomoStatsOmit<ExtArgs> | null;
    /**
     * The data used to create many MatomoStats.
     */
    data: Prisma.MatomoStatsCreateManyInput | Prisma.MatomoStatsCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * MatomoStats update
 */
export type MatomoStatsUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatomoStats
     */
    select?: Prisma.MatomoStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MatomoStats
     */
    omit?: Prisma.MatomoStatsOmit<ExtArgs> | null;
    /**
     * The data needed to update a MatomoStats.
     */
    data: Prisma.XOR<Prisma.MatomoStatsUpdateInput, Prisma.MatomoStatsUncheckedUpdateInput>;
    /**
     * Choose, which MatomoStats to update.
     */
    where: Prisma.MatomoStatsWhereUniqueInput;
};
/**
 * MatomoStats updateMany
 */
export type MatomoStatsUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update MatomoStats.
     */
    data: Prisma.XOR<Prisma.MatomoStatsUpdateManyMutationInput, Prisma.MatomoStatsUncheckedUpdateManyInput>;
    /**
     * Filter which MatomoStats to update
     */
    where?: Prisma.MatomoStatsWhereInput;
    /**
     * Limit how many MatomoStats to update.
     */
    limit?: number;
};
/**
 * MatomoStats updateManyAndReturn
 */
export type MatomoStatsUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatomoStats
     */
    select?: Prisma.MatomoStatsSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the MatomoStats
     */
    omit?: Prisma.MatomoStatsOmit<ExtArgs> | null;
    /**
     * The data used to update MatomoStats.
     */
    data: Prisma.XOR<Prisma.MatomoStatsUpdateManyMutationInput, Prisma.MatomoStatsUncheckedUpdateManyInput>;
    /**
     * Filter which MatomoStats to update
     */
    where?: Prisma.MatomoStatsWhereInput;
    /**
     * Limit how many MatomoStats to update.
     */
    limit?: number;
};
/**
 * MatomoStats upsert
 */
export type MatomoStatsUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatomoStats
     */
    select?: Prisma.MatomoStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MatomoStats
     */
    omit?: Prisma.MatomoStatsOmit<ExtArgs> | null;
    /**
     * The filter to search for the MatomoStats to update in case it exists.
     */
    where: Prisma.MatomoStatsWhereUniqueInput;
    /**
     * In case the MatomoStats found by the `where` argument doesn't exist, create a new MatomoStats with this data.
     */
    create: Prisma.XOR<Prisma.MatomoStatsCreateInput, Prisma.MatomoStatsUncheckedCreateInput>;
    /**
     * In case the MatomoStats was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.MatomoStatsUpdateInput, Prisma.MatomoStatsUncheckedUpdateInput>;
};
/**
 * MatomoStats delete
 */
export type MatomoStatsDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatomoStats
     */
    select?: Prisma.MatomoStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MatomoStats
     */
    omit?: Prisma.MatomoStatsOmit<ExtArgs> | null;
    /**
     * Filter which MatomoStats to delete.
     */
    where: Prisma.MatomoStatsWhereUniqueInput;
};
/**
 * MatomoStats deleteMany
 */
export type MatomoStatsDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which MatomoStats to delete
     */
    where?: Prisma.MatomoStatsWhereInput;
    /**
     * Limit how many MatomoStats to delete.
     */
    limit?: number;
};
/**
 * MatomoStats without action
 */
export type MatomoStatsDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MatomoStats
     */
    select?: Prisma.MatomoStatsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MatomoStats
     */
    omit?: Prisma.MatomoStatsOmit<ExtArgs> | null;
};
