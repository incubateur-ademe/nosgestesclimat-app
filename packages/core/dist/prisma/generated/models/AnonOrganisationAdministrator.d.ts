import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.ts";
/**
 * Model AnonOrganisationAdministrator
 *
 */
export type AnonOrganisationAdministratorModel = runtime.Types.Result.DefaultSelection<Prisma.$AnonOrganisationAdministratorPayload>;
export type AggregateAnonOrganisationAdministrator = {
    _count: AnonOrganisationAdministratorCountAggregateOutputType | null;
    _min: AnonOrganisationAdministratorMinAggregateOutputType | null;
    _max: AnonOrganisationAdministratorMaxAggregateOutputType | null;
};
export type AnonOrganisationAdministratorMinAggregateOutputType = {
    id: string | null;
    userEmail: string | null;
    organisationId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type AnonOrganisationAdministratorMaxAggregateOutputType = {
    id: string | null;
    userEmail: string | null;
    organisationId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type AnonOrganisationAdministratorCountAggregateOutputType = {
    id: number;
    userEmail: number;
    organisationId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type AnonOrganisationAdministratorMinAggregateInputType = {
    id?: true;
    userEmail?: true;
    organisationId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type AnonOrganisationAdministratorMaxAggregateInputType = {
    id?: true;
    userEmail?: true;
    organisationId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type AnonOrganisationAdministratorCountAggregateInputType = {
    id?: true;
    userEmail?: true;
    organisationId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type AnonOrganisationAdministratorAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which AnonOrganisationAdministrator to aggregate.
     */
    where?: Prisma.AnonOrganisationAdministratorWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnonOrganisationAdministrators to fetch.
     */
    orderBy?: Prisma.AnonOrganisationAdministratorOrderByWithRelationInput | Prisma.AnonOrganisationAdministratorOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.AnonOrganisationAdministratorWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnonOrganisationAdministrators from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnonOrganisationAdministrators.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned AnonOrganisationAdministrators
    **/
    _count?: true | AnonOrganisationAdministratorCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: AnonOrganisationAdministratorMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: AnonOrganisationAdministratorMaxAggregateInputType;
};
export type GetAnonOrganisationAdministratorAggregateType<T extends AnonOrganisationAdministratorAggregateArgs> = {
    [P in keyof T & keyof AggregateAnonOrganisationAdministrator]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAnonOrganisationAdministrator[P]> : Prisma.GetScalarType<T[P], AggregateAnonOrganisationAdministrator[P]>;
};
export type AnonOrganisationAdministratorGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AnonOrganisationAdministratorWhereInput;
    orderBy?: Prisma.AnonOrganisationAdministratorOrderByWithAggregationInput | Prisma.AnonOrganisationAdministratorOrderByWithAggregationInput[];
    by: Prisma.AnonOrganisationAdministratorScalarFieldEnum[] | Prisma.AnonOrganisationAdministratorScalarFieldEnum;
    having?: Prisma.AnonOrganisationAdministratorScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AnonOrganisationAdministratorCountAggregateInputType | true;
    _min?: AnonOrganisationAdministratorMinAggregateInputType;
    _max?: AnonOrganisationAdministratorMaxAggregateInputType;
};
export type AnonOrganisationAdministratorGroupByOutputType = {
    id: string;
    userEmail: string;
    organisationId: string;
    createdAt: Date;
    updatedAt: Date;
    _count: AnonOrganisationAdministratorCountAggregateOutputType | null;
    _min: AnonOrganisationAdministratorMinAggregateOutputType | null;
    _max: AnonOrganisationAdministratorMaxAggregateOutputType | null;
};
export type GetAnonOrganisationAdministratorGroupByPayload<T extends AnonOrganisationAdministratorGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AnonOrganisationAdministratorGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AnonOrganisationAdministratorGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AnonOrganisationAdministratorGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AnonOrganisationAdministratorGroupByOutputType[P]>;
}>>;
export type AnonOrganisationAdministratorWhereInput = {
    AND?: Prisma.AnonOrganisationAdministratorWhereInput | Prisma.AnonOrganisationAdministratorWhereInput[];
    OR?: Prisma.AnonOrganisationAdministratorWhereInput[];
    NOT?: Prisma.AnonOrganisationAdministratorWhereInput | Prisma.AnonOrganisationAdministratorWhereInput[];
    id?: Prisma.StringFilter<"AnonOrganisationAdministrator"> | string;
    userEmail?: Prisma.StringFilter<"AnonOrganisationAdministrator"> | string;
    organisationId?: Prisma.StringFilter<"AnonOrganisationAdministrator"> | string;
    createdAt?: Prisma.DateTimeFilter<"AnonOrganisationAdministrator"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"AnonOrganisationAdministrator"> | Date | string;
};
export type AnonOrganisationAdministratorOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userEmail?: Prisma.SortOrder;
    organisationId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AnonOrganisationAdministratorWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.AnonOrganisationAdministratorWhereInput | Prisma.AnonOrganisationAdministratorWhereInput[];
    OR?: Prisma.AnonOrganisationAdministratorWhereInput[];
    NOT?: Prisma.AnonOrganisationAdministratorWhereInput | Prisma.AnonOrganisationAdministratorWhereInput[];
    userEmail?: Prisma.StringFilter<"AnonOrganisationAdministrator"> | string;
    organisationId?: Prisma.StringFilter<"AnonOrganisationAdministrator"> | string;
    createdAt?: Prisma.DateTimeFilter<"AnonOrganisationAdministrator"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"AnonOrganisationAdministrator"> | Date | string;
}, "id">;
export type AnonOrganisationAdministratorOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userEmail?: Prisma.SortOrder;
    organisationId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.AnonOrganisationAdministratorCountOrderByAggregateInput;
    _max?: Prisma.AnonOrganisationAdministratorMaxOrderByAggregateInput;
    _min?: Prisma.AnonOrganisationAdministratorMinOrderByAggregateInput;
};
export type AnonOrganisationAdministratorScalarWhereWithAggregatesInput = {
    AND?: Prisma.AnonOrganisationAdministratorScalarWhereWithAggregatesInput | Prisma.AnonOrganisationAdministratorScalarWhereWithAggregatesInput[];
    OR?: Prisma.AnonOrganisationAdministratorScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AnonOrganisationAdministratorScalarWhereWithAggregatesInput | Prisma.AnonOrganisationAdministratorScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"AnonOrganisationAdministrator"> | string;
    userEmail?: Prisma.StringWithAggregatesFilter<"AnonOrganisationAdministrator"> | string;
    organisationId?: Prisma.StringWithAggregatesFilter<"AnonOrganisationAdministrator"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"AnonOrganisationAdministrator"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"AnonOrganisationAdministrator"> | Date | string;
};
export type AnonOrganisationAdministratorCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userEmail?: Prisma.SortOrder;
    organisationId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AnonOrganisationAdministratorMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userEmail?: Prisma.SortOrder;
    organisationId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AnonOrganisationAdministratorMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userEmail?: Prisma.SortOrder;
    organisationId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AnonOrganisationAdministratorSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userEmail?: boolean;
    organisationId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["anonOrganisationAdministrator"]>;
export type AnonOrganisationAdministratorSelectScalar = {
    id?: boolean;
    userEmail?: boolean;
    organisationId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type AnonOrganisationAdministratorOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userEmail" | "organisationId" | "createdAt" | "updatedAt", ExtArgs["result"]["anonOrganisationAdministrator"]>;
export type $AnonOrganisationAdministratorPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "AnonOrganisationAdministrator";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userEmail: string;
        organisationId: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["anonOrganisationAdministrator"]>;
    composites: {};
};
export type AnonOrganisationAdministratorGetPayload<S extends boolean | null | undefined | AnonOrganisationAdministratorDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AnonOrganisationAdministratorPayload, S>;
export type AnonOrganisationAdministratorCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AnonOrganisationAdministratorFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AnonOrganisationAdministratorCountAggregateInputType | true;
};
export interface AnonOrganisationAdministratorDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['AnonOrganisationAdministrator'];
        meta: {
            name: 'AnonOrganisationAdministrator';
        };
    };
    /**
     * Find zero or one AnonOrganisationAdministrator that matches the filter.
     * @param {AnonOrganisationAdministratorFindUniqueArgs} args - Arguments to find a AnonOrganisationAdministrator
     * @example
     * // Get one AnonOrganisationAdministrator
     * const anonOrganisationAdministrator = await prisma.anonOrganisationAdministrator.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AnonOrganisationAdministratorFindUniqueArgs>(args: Prisma.SelectSubset<T, AnonOrganisationAdministratorFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AnonOrganisationAdministratorClient<runtime.Types.Result.GetResult<Prisma.$AnonOrganisationAdministratorPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one AnonOrganisationAdministrator that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AnonOrganisationAdministratorFindUniqueOrThrowArgs} args - Arguments to find a AnonOrganisationAdministrator
     * @example
     * // Get one AnonOrganisationAdministrator
     * const anonOrganisationAdministrator = await prisma.anonOrganisationAdministrator.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AnonOrganisationAdministratorFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AnonOrganisationAdministratorFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AnonOrganisationAdministratorClient<runtime.Types.Result.GetResult<Prisma.$AnonOrganisationAdministratorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first AnonOrganisationAdministrator that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonOrganisationAdministratorFindFirstArgs} args - Arguments to find a AnonOrganisationAdministrator
     * @example
     * // Get one AnonOrganisationAdministrator
     * const anonOrganisationAdministrator = await prisma.anonOrganisationAdministrator.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AnonOrganisationAdministratorFindFirstArgs>(args?: Prisma.SelectSubset<T, AnonOrganisationAdministratorFindFirstArgs<ExtArgs>>): Prisma.Prisma__AnonOrganisationAdministratorClient<runtime.Types.Result.GetResult<Prisma.$AnonOrganisationAdministratorPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first AnonOrganisationAdministrator that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonOrganisationAdministratorFindFirstOrThrowArgs} args - Arguments to find a AnonOrganisationAdministrator
     * @example
     * // Get one AnonOrganisationAdministrator
     * const anonOrganisationAdministrator = await prisma.anonOrganisationAdministrator.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AnonOrganisationAdministratorFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AnonOrganisationAdministratorFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AnonOrganisationAdministratorClient<runtime.Types.Result.GetResult<Prisma.$AnonOrganisationAdministratorPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more AnonOrganisationAdministrators that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonOrganisationAdministratorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AnonOrganisationAdministrators
     * const anonOrganisationAdministrators = await prisma.anonOrganisationAdministrator.findMany()
     *
     * // Get first 10 AnonOrganisationAdministrators
     * const anonOrganisationAdministrators = await prisma.anonOrganisationAdministrator.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const anonOrganisationAdministratorWithIdOnly = await prisma.anonOrganisationAdministrator.findMany({ select: { id: true } })
     *
     */
    findMany<T extends AnonOrganisationAdministratorFindManyArgs>(args?: Prisma.SelectSubset<T, AnonOrganisationAdministratorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AnonOrganisationAdministratorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Count the number of AnonOrganisationAdministrators.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonOrganisationAdministratorCountArgs} args - Arguments to filter AnonOrganisationAdministrators to count.
     * @example
     * // Count the number of AnonOrganisationAdministrators
     * const count = await prisma.anonOrganisationAdministrator.count({
     *   where: {
     *     // ... the filter for the AnonOrganisationAdministrators we want to count
     *   }
     * })
    **/
    count<T extends AnonOrganisationAdministratorCountArgs>(args?: Prisma.Subset<T, AnonOrganisationAdministratorCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AnonOrganisationAdministratorCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a AnonOrganisationAdministrator.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonOrganisationAdministratorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AnonOrganisationAdministratorAggregateArgs>(args: Prisma.Subset<T, AnonOrganisationAdministratorAggregateArgs>): Prisma.PrismaPromise<GetAnonOrganisationAdministratorAggregateType<T>>;
    /**
     * Group by AnonOrganisationAdministrator.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AnonOrganisationAdministratorGroupByArgs} args - Group by arguments.
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
    groupBy<T extends AnonOrganisationAdministratorGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AnonOrganisationAdministratorGroupByArgs['orderBy'];
    } : {
        orderBy?: AnonOrganisationAdministratorGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AnonOrganisationAdministratorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAnonOrganisationAdministratorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the AnonOrganisationAdministrator model
     */
    readonly fields: AnonOrganisationAdministratorFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for AnonOrganisationAdministrator.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__AnonOrganisationAdministratorClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the AnonOrganisationAdministrator model
 */
export interface AnonOrganisationAdministratorFieldRefs {
    readonly id: Prisma.FieldRef<"AnonOrganisationAdministrator", 'String'>;
    readonly userEmail: Prisma.FieldRef<"AnonOrganisationAdministrator", 'String'>;
    readonly organisationId: Prisma.FieldRef<"AnonOrganisationAdministrator", 'String'>;
    readonly createdAt: Prisma.FieldRef<"AnonOrganisationAdministrator", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"AnonOrganisationAdministrator", 'DateTime'>;
}
/**
 * AnonOrganisationAdministrator findUnique
 */
export type AnonOrganisationAdministratorFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonOrganisationAdministrator
     */
    select?: Prisma.AnonOrganisationAdministratorSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonOrganisationAdministrator
     */
    omit?: Prisma.AnonOrganisationAdministratorOmit<ExtArgs> | null;
    /**
     * Filter, which AnonOrganisationAdministrator to fetch.
     */
    where: Prisma.AnonOrganisationAdministratorWhereUniqueInput;
};
/**
 * AnonOrganisationAdministrator findUniqueOrThrow
 */
export type AnonOrganisationAdministratorFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonOrganisationAdministrator
     */
    select?: Prisma.AnonOrganisationAdministratorSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonOrganisationAdministrator
     */
    omit?: Prisma.AnonOrganisationAdministratorOmit<ExtArgs> | null;
    /**
     * Filter, which AnonOrganisationAdministrator to fetch.
     */
    where: Prisma.AnonOrganisationAdministratorWhereUniqueInput;
};
/**
 * AnonOrganisationAdministrator findFirst
 */
export type AnonOrganisationAdministratorFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonOrganisationAdministrator
     */
    select?: Prisma.AnonOrganisationAdministratorSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonOrganisationAdministrator
     */
    omit?: Prisma.AnonOrganisationAdministratorOmit<ExtArgs> | null;
    /**
     * Filter, which AnonOrganisationAdministrator to fetch.
     */
    where?: Prisma.AnonOrganisationAdministratorWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnonOrganisationAdministrators to fetch.
     */
    orderBy?: Prisma.AnonOrganisationAdministratorOrderByWithRelationInput | Prisma.AnonOrganisationAdministratorOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AnonOrganisationAdministrators.
     */
    cursor?: Prisma.AnonOrganisationAdministratorWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnonOrganisationAdministrators from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnonOrganisationAdministrators.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AnonOrganisationAdministrators.
     */
    distinct?: Prisma.AnonOrganisationAdministratorScalarFieldEnum | Prisma.AnonOrganisationAdministratorScalarFieldEnum[];
};
/**
 * AnonOrganisationAdministrator findFirstOrThrow
 */
export type AnonOrganisationAdministratorFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonOrganisationAdministrator
     */
    select?: Prisma.AnonOrganisationAdministratorSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonOrganisationAdministrator
     */
    omit?: Prisma.AnonOrganisationAdministratorOmit<ExtArgs> | null;
    /**
     * Filter, which AnonOrganisationAdministrator to fetch.
     */
    where?: Prisma.AnonOrganisationAdministratorWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnonOrganisationAdministrators to fetch.
     */
    orderBy?: Prisma.AnonOrganisationAdministratorOrderByWithRelationInput | Prisma.AnonOrganisationAdministratorOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AnonOrganisationAdministrators.
     */
    cursor?: Prisma.AnonOrganisationAdministratorWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnonOrganisationAdministrators from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnonOrganisationAdministrators.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AnonOrganisationAdministrators.
     */
    distinct?: Prisma.AnonOrganisationAdministratorScalarFieldEnum | Prisma.AnonOrganisationAdministratorScalarFieldEnum[];
};
/**
 * AnonOrganisationAdministrator findMany
 */
export type AnonOrganisationAdministratorFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonOrganisationAdministrator
     */
    select?: Prisma.AnonOrganisationAdministratorSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonOrganisationAdministrator
     */
    omit?: Prisma.AnonOrganisationAdministratorOmit<ExtArgs> | null;
    /**
     * Filter, which AnonOrganisationAdministrators to fetch.
     */
    where?: Prisma.AnonOrganisationAdministratorWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AnonOrganisationAdministrators to fetch.
     */
    orderBy?: Prisma.AnonOrganisationAdministratorOrderByWithRelationInput | Prisma.AnonOrganisationAdministratorOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing AnonOrganisationAdministrators.
     */
    cursor?: Prisma.AnonOrganisationAdministratorWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AnonOrganisationAdministrators from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AnonOrganisationAdministrators.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AnonOrganisationAdministrators.
     */
    distinct?: Prisma.AnonOrganisationAdministratorScalarFieldEnum | Prisma.AnonOrganisationAdministratorScalarFieldEnum[];
};
/**
 * AnonOrganisationAdministrator without action
 */
export type AnonOrganisationAdministratorDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AnonOrganisationAdministrator
     */
    select?: Prisma.AnonOrganisationAdministratorSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AnonOrganisationAdministrator
     */
    omit?: Prisma.AnonOrganisationAdministratorOmit<ExtArgs> | null;
};
