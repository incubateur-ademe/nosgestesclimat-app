import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.ts";
import type * as Prisma from "../internal/prismaNamespace.ts";
/**
 * Model AnonOrganisation
 *
 */
export type AnonOrganisationModel = runtime.Types.Result.DefaultSelection<Prisma.$AnonOrganisationPayload>;
export type AggregateAnonOrganisation = {
    _count: AnonOrganisationCountAggregateOutputType | null;
    _avg: AnonOrganisationAvgAggregateOutputType | null;
    _sum: AnonOrganisationSumAggregateOutputType | null;
    _min: AnonOrganisationMinAggregateOutputType | null;
    _max: AnonOrganisationMaxAggregateOutputType | null;
};
export type AnonOrganisationAvgAggregateOutputType = {
    numberOfCollaborators: number | null;
};
export type AnonOrganisationSumAggregateOutputType = {
    numberOfCollaborators: number | null;
};
export type AnonOrganisationMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    slug: string | null;
    type: $Enums.OrganisationType | null;
    numberOfCollaborators: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type AnonOrganisationMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    slug: string | null;
    type: $Enums.OrganisationType | null;
    numberOfCollaborators: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type AnonOrganisationCountAggregateOutputType = {
    id: number;
    name: number;
    slug: number;
    type: number;
    numberOfCollaborators: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type AnonOrganisationAvgAggregateInputType = {
    numberOfCollaborators?: true;
};
export type AnonOrganisationSumAggregateInputType = {
    numberOfCollaborators?: true;
};
export type AnonOrganisationMinAggregateInputType = {
    id?: true;
    name?: true;
    slug?: true;
    type?: true;
    numberOfCollaborators?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type AnonOrganisationMaxAggregateInputType = {
    id?: true;
    name?: true;
    slug?: true;
    type?: true;
    numberOfCollaborators?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type AnonOrganisationCountAggregateInputType = {
    id?: true;
    name?: true;
    slug?: true;
    type?: true;
    numberOfCollaborators?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type AnonOrganisationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which AnonOrganisation to aggregate.
     */
    where?: Prisma.AnonOrganisationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnonOrganisations to fetch.
     */
    orderBy?: Prisma.AnonOrganisationOrderByWithRelationInput | Prisma.AnonOrganisationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.AnonOrganisationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnonOrganisations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnonOrganisations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned AnonOrganisations
    **/
    _count?: true | AnonOrganisationCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: AnonOrganisationAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: AnonOrganisationSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: AnonOrganisationMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: AnonOrganisationMaxAggregateInputType;
};
export type GetAnonOrganisationAggregateType<T extends AnonOrganisationAggregateArgs> = {
    [P in keyof T & keyof AggregateAnonOrganisation]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAnonOrganisation[P]> : Prisma.GetScalarType<T[P], AggregateAnonOrganisation[P]>;
};
export type AnonOrganisationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AnonOrganisationWhereInput;
    orderBy?: Prisma.AnonOrganisationOrderByWithAggregationInput | Prisma.AnonOrganisationOrderByWithAggregationInput[];
    by: Prisma.AnonOrganisationScalarFieldEnum[] | Prisma.AnonOrganisationScalarFieldEnum;
    having?: Prisma.AnonOrganisationScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AnonOrganisationCountAggregateInputType | true;
    _avg?: AnonOrganisationAvgAggregateInputType;
    _sum?: AnonOrganisationSumAggregateInputType;
    _min?: AnonOrganisationMinAggregateInputType;
    _max?: AnonOrganisationMaxAggregateInputType;
};
export type AnonOrganisationGroupByOutputType = {
    id: string;
    name: string;
    slug: string;
    type: $Enums.OrganisationType;
    numberOfCollaborators: number | null;
    createdAt: Date;
    updatedAt: Date;
    _count: AnonOrganisationCountAggregateOutputType | null;
    _avg: AnonOrganisationAvgAggregateOutputType | null;
    _sum: AnonOrganisationSumAggregateOutputType | null;
    _min: AnonOrganisationMinAggregateOutputType | null;
    _max: AnonOrganisationMaxAggregateOutputType | null;
};
export type GetAnonOrganisationGroupByPayload<T extends AnonOrganisationGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AnonOrganisationGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AnonOrganisationGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AnonOrganisationGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AnonOrganisationGroupByOutputType[P]>;
}>>;
export type AnonOrganisationWhereInput = {
    AND?: Prisma.AnonOrganisationWhereInput | Prisma.AnonOrganisationWhereInput[];
    OR?: Prisma.AnonOrganisationWhereInput[];
    NOT?: Prisma.AnonOrganisationWhereInput | Prisma.AnonOrganisationWhereInput[];
    id?: Prisma.StringFilter<"AnonOrganisation"> | string;
    name?: Prisma.StringFilter<"AnonOrganisation"> | string;
    slug?: Prisma.StringFilter<"AnonOrganisation"> | string;
    type?: Prisma.EnumOrganisationTypeFilter<"AnonOrganisation"> | $Enums.OrganisationType;
    numberOfCollaborators?: Prisma.IntNullableFilter<"AnonOrganisation"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"AnonOrganisation"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"AnonOrganisation"> | Date | string;
};
export type AnonOrganisationOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    numberOfCollaborators?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AnonOrganisationWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.AnonOrganisationWhereInput | Prisma.AnonOrganisationWhereInput[];
    OR?: Prisma.AnonOrganisationWhereInput[];
    NOT?: Prisma.AnonOrganisationWhereInput | Prisma.AnonOrganisationWhereInput[];
    name?: Prisma.StringFilter<"AnonOrganisation"> | string;
    slug?: Prisma.StringFilter<"AnonOrganisation"> | string;
    type?: Prisma.EnumOrganisationTypeFilter<"AnonOrganisation"> | $Enums.OrganisationType;
    numberOfCollaborators?: Prisma.IntNullableFilter<"AnonOrganisation"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"AnonOrganisation"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"AnonOrganisation"> | Date | string;
}, "id">;
export type AnonOrganisationOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    numberOfCollaborators?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.AnonOrganisationCountOrderByAggregateInput;
    _avg?: Prisma.AnonOrganisationAvgOrderByAggregateInput;
    _max?: Prisma.AnonOrganisationMaxOrderByAggregateInput;
    _min?: Prisma.AnonOrganisationMinOrderByAggregateInput;
    _sum?: Prisma.AnonOrganisationSumOrderByAggregateInput;
};
export type AnonOrganisationScalarWhereWithAggregatesInput = {
    AND?: Prisma.AnonOrganisationScalarWhereWithAggregatesInput | Prisma.AnonOrganisationScalarWhereWithAggregatesInput[];
    OR?: Prisma.AnonOrganisationScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AnonOrganisationScalarWhereWithAggregatesInput | Prisma.AnonOrganisationScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"AnonOrganisation"> | string;
    name?: Prisma.StringWithAggregatesFilter<"AnonOrganisation"> | string;
    slug?: Prisma.StringWithAggregatesFilter<"AnonOrganisation"> | string;
    type?: Prisma.EnumOrganisationTypeWithAggregatesFilter<"AnonOrganisation"> | $Enums.OrganisationType;
    numberOfCollaborators?: Prisma.IntNullableWithAggregatesFilter<"AnonOrganisation"> | number | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"AnonOrganisation"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"AnonOrganisation"> | Date | string;
};
export type AnonOrganisationCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    numberOfCollaborators?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AnonOrganisationAvgOrderByAggregateInput = {
    numberOfCollaborators?: Prisma.SortOrder;
};
export type AnonOrganisationMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    numberOfCollaborators?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AnonOrganisationMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    slug?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    numberOfCollaborators?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AnonOrganisationSumOrderByAggregateInput = {
    numberOfCollaborators?: Prisma.SortOrder;
};
export type AnonOrganisationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    slug?: boolean;
    type?: boolean;
    numberOfCollaborators?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["anonOrganisation"]>;
export type AnonOrganisationSelectScalar = {
    id?: boolean;
    name?: boolean;
    slug?: boolean;
    type?: boolean;
    numberOfCollaborators?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type AnonOrganisationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "slug" | "type" | "numberOfCollaborators" | "createdAt" | "updatedAt", ExtArgs["result"]["anonOrganisation"]>;
export type $AnonOrganisationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "AnonOrganisation";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        slug: string;
        type: $Enums.OrganisationType;
        numberOfCollaborators: number | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["anonOrganisation"]>;
    composites: {};
};
export type AnonOrganisationGetPayload<S extends boolean | null | undefined | AnonOrganisationDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AnonOrganisationPayload, S>;
export type AnonOrganisationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AnonOrganisationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AnonOrganisationCountAggregateInputType | true;
};
export interface AnonOrganisationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['AnonOrganisation'];
        meta: {
            name: 'AnonOrganisation';
        };
    };
    /**
     * Find zero or one AnonOrganisation that matches the filter.
     * @param {AnonOrganisationFindUniqueArgs} args - Arguments to find a AnonOrganisation
     * @example
     * // Get one AnonOrganisation
     * const anonOrganisation = await prisma.anonOrganisation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnonOrganisationFindUniqueArgs>(args: Prisma.SelectSubset<T, AnonOrganisationFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AnonOrganisationClient<runtime.Types.Result.GetResult<Prisma.$AnonOrganisationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one AnonOrganisation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnonOrganisationFindUniqueOrThrowArgs} args - Arguments to find a AnonOrganisation
     * @example
     * // Get one AnonOrganisation
     * const anonOrganisation = await prisma.anonOrganisation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnonOrganisationFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AnonOrganisationFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AnonOrganisationClient<runtime.Types.Result.GetResult<Prisma.$AnonOrganisationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first AnonOrganisation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonOrganisationFindFirstArgs} args - Arguments to find a AnonOrganisation
     * @example
     * // Get one AnonOrganisation
     * const anonOrganisation = await prisma.anonOrganisation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnonOrganisationFindFirstArgs>(args?: Prisma.SelectSubset<T, AnonOrganisationFindFirstArgs<ExtArgs>>): Prisma.Prisma__AnonOrganisationClient<runtime.Types.Result.GetResult<Prisma.$AnonOrganisationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first AnonOrganisation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonOrganisationFindFirstOrThrowArgs} args - Arguments to find a AnonOrganisation
     * @example
     * // Get one AnonOrganisation
     * const anonOrganisation = await prisma.anonOrganisation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnonOrganisationFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AnonOrganisationFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AnonOrganisationClient<runtime.Types.Result.GetResult<Prisma.$AnonOrganisationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more AnonOrganisations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonOrganisationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AnonOrganisations
     * const anonOrganisations = await prisma.anonOrganisation.findMany()
     *
     * // Get first 10 AnonOrganisations
     * const anonOrganisations = await prisma.anonOrganisation.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const anonOrganisationWithIdOnly = await prisma.anonOrganisation.findMany({ select: { id: true } })
     *
     */
    findMany<T extends AnonOrganisationFindManyArgs>(args?: Prisma.SelectSubset<T, AnonOrganisationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AnonOrganisationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Count the number of AnonOrganisations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonOrganisationCountArgs} args - Arguments to filter AnonOrganisations to count.
     * @example
     * // Count the number of AnonOrganisations
     * const count = await prisma.anonOrganisation.count({
     *   where: {
     *     // ... the filter for the AnonOrganisations we want to count
     *   }
     * })
    **/
    count<T extends AnonOrganisationCountArgs>(args?: Prisma.Subset<T, AnonOrganisationCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AnonOrganisationCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a AnonOrganisation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonOrganisationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AnonOrganisationAggregateArgs>(args: Prisma.Subset<T, AnonOrganisationAggregateArgs>): Prisma.PrismaPromise<GetAnonOrganisationAggregateType<T>>;
    /**
     * Group by AnonOrganisation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonOrganisationGroupByArgs} args - Group by arguments.
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
    groupBy<T extends AnonOrganisationGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AnonOrganisationGroupByArgs['orderBy'];
    } : {
        orderBy?: AnonOrganisationGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AnonOrganisationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnonOrganisationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the AnonOrganisation model
     */
    readonly fields: AnonOrganisationFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for AnonOrganisation.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__AnonOrganisationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the AnonOrganisation model
 */
export interface AnonOrganisationFieldRefs {
    readonly id: Prisma.FieldRef<"AnonOrganisation", 'String'>;
    readonly name: Prisma.FieldRef<"AnonOrganisation", 'String'>;
    readonly slug: Prisma.FieldRef<"AnonOrganisation", 'String'>;
    readonly type: Prisma.FieldRef<"AnonOrganisation", 'OrganisationType'>;
    readonly numberOfCollaborators: Prisma.FieldRef<"AnonOrganisation", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"AnonOrganisation", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"AnonOrganisation", 'DateTime'>;
}
/**
 * AnonOrganisation findUnique
 */
export type AnonOrganisationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonOrganisation
     */
    select?: Prisma.AnonOrganisationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonOrganisation
     */
    omit?: Prisma.AnonOrganisationOmit<ExtArgs> | null;
    /**
     * Filter, which AnonOrganisation to fetch.
     */
    where: Prisma.AnonOrganisationWhereUniqueInput;
};
/**
 * AnonOrganisation findUniqueOrThrow
 */
export type AnonOrganisationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonOrganisation
     */
    select?: Prisma.AnonOrganisationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonOrganisation
     */
    omit?: Prisma.AnonOrganisationOmit<ExtArgs> | null;
    /**
     * Filter, which AnonOrganisation to fetch.
     */
    where: Prisma.AnonOrganisationWhereUniqueInput;
};
/**
 * AnonOrganisation findFirst
 */
export type AnonOrganisationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonOrganisation
     */
    select?: Prisma.AnonOrganisationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonOrganisation
     */
    omit?: Prisma.AnonOrganisationOmit<ExtArgs> | null;
    /**
     * Filter, which AnonOrganisation to fetch.
     */
    where?: Prisma.AnonOrganisationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnonOrganisations to fetch.
     */
    orderBy?: Prisma.AnonOrganisationOrderByWithRelationInput | Prisma.AnonOrganisationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AnonOrganisations.
     */
    cursor?: Prisma.AnonOrganisationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnonOrganisations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnonOrganisations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AnonOrganisations.
     */
    distinct?: Prisma.AnonOrganisationScalarFieldEnum | Prisma.AnonOrganisationScalarFieldEnum[];
};
/**
 * AnonOrganisation findFirstOrThrow
 */
export type AnonOrganisationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonOrganisation
     */
    select?: Prisma.AnonOrganisationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonOrganisation
     */
    omit?: Prisma.AnonOrganisationOmit<ExtArgs> | null;
    /**
     * Filter, which AnonOrganisation to fetch.
     */
    where?: Prisma.AnonOrganisationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnonOrganisations to fetch.
     */
    orderBy?: Prisma.AnonOrganisationOrderByWithRelationInput | Prisma.AnonOrganisationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AnonOrganisations.
     */
    cursor?: Prisma.AnonOrganisationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnonOrganisations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnonOrganisations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AnonOrganisations.
     */
    distinct?: Prisma.AnonOrganisationScalarFieldEnum | Prisma.AnonOrganisationScalarFieldEnum[];
};
/**
 * AnonOrganisation findMany
 */
export type AnonOrganisationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonOrganisation
     */
    select?: Prisma.AnonOrganisationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonOrganisation
     */
    omit?: Prisma.AnonOrganisationOmit<ExtArgs> | null;
    /**
     * Filter, which AnonOrganisations to fetch.
     */
    where?: Prisma.AnonOrganisationWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnonOrganisations to fetch.
     */
    orderBy?: Prisma.AnonOrganisationOrderByWithRelationInput | Prisma.AnonOrganisationOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing AnonOrganisations.
     */
    cursor?: Prisma.AnonOrganisationWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnonOrganisations from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnonOrganisations.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AnonOrganisations.
     */
    distinct?: Prisma.AnonOrganisationScalarFieldEnum | Prisma.AnonOrganisationScalarFieldEnum[];
};
/**
 * AnonOrganisation without action
 */
export type AnonOrganisationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonOrganisation
     */
    select?: Prisma.AnonOrganisationSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonOrganisation
     */
    omit?: Prisma.AnonOrganisationOmit<ExtArgs> | null;
};
