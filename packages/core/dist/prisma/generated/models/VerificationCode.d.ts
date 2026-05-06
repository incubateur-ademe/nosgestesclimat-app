import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.ts";
import type * as Prisma from "../internal/prismaNamespace.ts";
/**
 * Model VerificationCode
 *
 */
export type VerificationCodeModel = runtime.Types.Result.DefaultSelection<Prisma.$VerificationCodePayload>;
export type AggregateVerificationCode = {
    _count: VerificationCodeCountAggregateOutputType | null;
    _min: VerificationCodeMinAggregateOutputType | null;
    _max: VerificationCodeMaxAggregateOutputType | null;
};
export type VerificationCodeMinAggregateOutputType = {
    id: string | null;
    email: string | null;
    mode: $Enums.VerificationCodeMode | null;
    code: string | null;
    expirationDate: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type VerificationCodeMaxAggregateOutputType = {
    id: string | null;
    email: string | null;
    mode: $Enums.VerificationCodeMode | null;
    code: string | null;
    expirationDate: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type VerificationCodeCountAggregateOutputType = {
    id: number;
    email: number;
    mode: number;
    code: number;
    expirationDate: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type VerificationCodeMinAggregateInputType = {
    id?: true;
    email?: true;
    mode?: true;
    code?: true;
    expirationDate?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type VerificationCodeMaxAggregateInputType = {
    id?: true;
    email?: true;
    mode?: true;
    code?: true;
    expirationDate?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type VerificationCodeCountAggregateInputType = {
    id?: true;
    email?: true;
    mode?: true;
    code?: true;
    expirationDate?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type VerificationCodeAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationCode to aggregate.
     */
    where?: Prisma.VerificationCodeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationCodes to fetch.
     */
    orderBy?: Prisma.VerificationCodeOrderByWithRelationInput | Prisma.VerificationCodeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.VerificationCodeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationCodes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationCodes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned VerificationCodes
    **/
    _count?: true | VerificationCodeCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: VerificationCodeMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: VerificationCodeMaxAggregateInputType;
};
export type GetVerificationCodeAggregateType<T extends VerificationCodeAggregateArgs> = {
    [P in keyof T & keyof AggregateVerificationCode]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateVerificationCode[P]> : Prisma.GetScalarType<T[P], AggregateVerificationCode[P]>;
};
export type VerificationCodeGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.VerificationCodeWhereInput;
    orderBy?: Prisma.VerificationCodeOrderByWithAggregationInput | Prisma.VerificationCodeOrderByWithAggregationInput[];
    by: Prisma.VerificationCodeScalarFieldEnum[] | Prisma.VerificationCodeScalarFieldEnum;
    having?: Prisma.VerificationCodeScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: VerificationCodeCountAggregateInputType | true;
    _min?: VerificationCodeMinAggregateInputType;
    _max?: VerificationCodeMaxAggregateInputType;
};
export type VerificationCodeGroupByOutputType = {
    id: string;
    email: string;
    mode: $Enums.VerificationCodeMode | null;
    code: string;
    expirationDate: Date;
    createdAt: Date;
    updatedAt: Date;
    _count: VerificationCodeCountAggregateOutputType | null;
    _min: VerificationCodeMinAggregateOutputType | null;
    _max: VerificationCodeMaxAggregateOutputType | null;
};
export type GetVerificationCodeGroupByPayload<T extends VerificationCodeGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<VerificationCodeGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof VerificationCodeGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], VerificationCodeGroupByOutputType[P]> : Prisma.GetScalarType<T[P], VerificationCodeGroupByOutputType[P]>;
}>>;
export type VerificationCodeWhereInput = {
    AND?: Prisma.VerificationCodeWhereInput | Prisma.VerificationCodeWhereInput[];
    OR?: Prisma.VerificationCodeWhereInput[];
    NOT?: Prisma.VerificationCodeWhereInput | Prisma.VerificationCodeWhereInput[];
    id?: Prisma.UuidFilter<"VerificationCode"> | string;
    email?: Prisma.StringFilter<"VerificationCode"> | string;
    mode?: Prisma.EnumVerificationCodeModeNullableFilter<"VerificationCode"> | $Enums.VerificationCodeMode | null;
    code?: Prisma.StringFilter<"VerificationCode"> | string;
    expirationDate?: Prisma.DateTimeFilter<"VerificationCode"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"VerificationCode"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"VerificationCode"> | Date | string;
};
export type VerificationCodeOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    mode?: Prisma.SortOrderInput | Prisma.SortOrder;
    code?: Prisma.SortOrder;
    expirationDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type VerificationCodeWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.VerificationCodeWhereInput | Prisma.VerificationCodeWhereInput[];
    OR?: Prisma.VerificationCodeWhereInput[];
    NOT?: Prisma.VerificationCodeWhereInput | Prisma.VerificationCodeWhereInput[];
    email?: Prisma.StringFilter<"VerificationCode"> | string;
    mode?: Prisma.EnumVerificationCodeModeNullableFilter<"VerificationCode"> | $Enums.VerificationCodeMode | null;
    code?: Prisma.StringFilter<"VerificationCode"> | string;
    expirationDate?: Prisma.DateTimeFilter<"VerificationCode"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"VerificationCode"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"VerificationCode"> | Date | string;
}, "id">;
export type VerificationCodeOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    mode?: Prisma.SortOrderInput | Prisma.SortOrder;
    code?: Prisma.SortOrder;
    expirationDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.VerificationCodeCountOrderByAggregateInput;
    _max?: Prisma.VerificationCodeMaxOrderByAggregateInput;
    _min?: Prisma.VerificationCodeMinOrderByAggregateInput;
};
export type VerificationCodeScalarWhereWithAggregatesInput = {
    AND?: Prisma.VerificationCodeScalarWhereWithAggregatesInput | Prisma.VerificationCodeScalarWhereWithAggregatesInput[];
    OR?: Prisma.VerificationCodeScalarWhereWithAggregatesInput[];
    NOT?: Prisma.VerificationCodeScalarWhereWithAggregatesInput | Prisma.VerificationCodeScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"VerificationCode"> | string;
    email?: Prisma.StringWithAggregatesFilter<"VerificationCode"> | string;
    mode?: Prisma.EnumVerificationCodeModeNullableWithAggregatesFilter<"VerificationCode"> | $Enums.VerificationCodeMode | null;
    code?: Prisma.StringWithAggregatesFilter<"VerificationCode"> | string;
    expirationDate?: Prisma.DateTimeWithAggregatesFilter<"VerificationCode"> | Date | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"VerificationCode"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"VerificationCode"> | Date | string;
};
export type VerificationCodeCreateInput = {
    id?: string;
    email: string;
    mode?: $Enums.VerificationCodeMode | null;
    code: string;
    expirationDate: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type VerificationCodeUncheckedCreateInput = {
    id?: string;
    email: string;
    mode?: $Enums.VerificationCodeMode | null;
    code: string;
    expirationDate: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type VerificationCodeUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    mode?: Prisma.NullableEnumVerificationCodeModeFieldUpdateOperationsInput | $Enums.VerificationCodeMode | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    expirationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VerificationCodeUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    mode?: Prisma.NullableEnumVerificationCodeModeFieldUpdateOperationsInput | $Enums.VerificationCodeMode | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    expirationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VerificationCodeCreateManyInput = {
    id?: string;
    email: string;
    mode?: $Enums.VerificationCodeMode | null;
    code: string;
    expirationDate: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type VerificationCodeUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    mode?: Prisma.NullableEnumVerificationCodeModeFieldUpdateOperationsInput | $Enums.VerificationCodeMode | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    expirationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VerificationCodeUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    mode?: Prisma.NullableEnumVerificationCodeModeFieldUpdateOperationsInput | $Enums.VerificationCodeMode | null;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    expirationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VerificationCodeCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    expirationDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type VerificationCodeMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    expirationDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type VerificationCodeMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    expirationDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type NullableEnumVerificationCodeModeFieldUpdateOperationsInput = {
    set?: $Enums.VerificationCodeMode | null;
};
export type VerificationCodeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    mode?: boolean;
    code?: boolean;
    expirationDate?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["verificationCode"]>;
export type VerificationCodeSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    mode?: boolean;
    code?: boolean;
    expirationDate?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["verificationCode"]>;
export type VerificationCodeSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    mode?: boolean;
    code?: boolean;
    expirationDate?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["verificationCode"]>;
export type VerificationCodeSelectScalar = {
    id?: boolean;
    email?: boolean;
    mode?: boolean;
    code?: boolean;
    expirationDate?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type VerificationCodeOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "email" | "mode" | "code" | "expirationDate" | "createdAt" | "updatedAt", ExtArgs["result"]["verificationCode"]>;
export type $VerificationCodePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "VerificationCode";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        email: string;
        mode: $Enums.VerificationCodeMode | null;
        code: string;
        expirationDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["verificationCode"]>;
    composites: {};
};
export type VerificationCodeGetPayload<S extends boolean | null | undefined | VerificationCodeDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$VerificationCodePayload, S>;
export type VerificationCodeCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<VerificationCodeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: VerificationCodeCountAggregateInputType | true;
};
export interface VerificationCodeDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['VerificationCode'];
        meta: {
            name: 'VerificationCode';
        };
    };
    /**
     * Find zero or one VerificationCode that matches the filter.
     * @param {VerificationCodeFindUniqueArgs} args - Arguments to find a VerificationCode
     * @example
     * // Get one VerificationCode
     * const verificationCode = await prisma.verificationCode.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VerificationCodeFindUniqueArgs>(args: Prisma.SelectSubset<T, VerificationCodeFindUniqueArgs<ExtArgs>>): Prisma.Prisma__VerificationCodeClient<runtime.Types.Result.GetResult<Prisma.$VerificationCodePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one VerificationCode that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VerificationCodeFindUniqueOrThrowArgs} args - Arguments to find a VerificationCode
     * @example
     * // Get one VerificationCode
     * const verificationCode = await prisma.verificationCode.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VerificationCodeFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, VerificationCodeFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__VerificationCodeClient<runtime.Types.Result.GetResult<Prisma.$VerificationCodePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first VerificationCode that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationCodeFindFirstArgs} args - Arguments to find a VerificationCode
     * @example
     * // Get one VerificationCode
     * const verificationCode = await prisma.verificationCode.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VerificationCodeFindFirstArgs>(args?: Prisma.SelectSubset<T, VerificationCodeFindFirstArgs<ExtArgs>>): Prisma.Prisma__VerificationCodeClient<runtime.Types.Result.GetResult<Prisma.$VerificationCodePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first VerificationCode that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationCodeFindFirstOrThrowArgs} args - Arguments to find a VerificationCode
     * @example
     * // Get one VerificationCode
     * const verificationCode = await prisma.verificationCode.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VerificationCodeFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, VerificationCodeFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__VerificationCodeClient<runtime.Types.Result.GetResult<Prisma.$VerificationCodePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more VerificationCodes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationCodeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VerificationCodes
     * const verificationCodes = await prisma.verificationCode.findMany()
     *
     * // Get first 10 VerificationCodes
     * const verificationCodes = await prisma.verificationCode.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const verificationCodeWithIdOnly = await prisma.verificationCode.findMany({ select: { id: true } })
     *
     */
    findMany<T extends VerificationCodeFindManyArgs>(args?: Prisma.SelectSubset<T, VerificationCodeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationCodePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a VerificationCode.
     * @param {VerificationCodeCreateArgs} args - Arguments to create a VerificationCode.
     * @example
     * // Create one VerificationCode
     * const VerificationCode = await prisma.verificationCode.create({
     *   data: {
     *     // ... data to create a VerificationCode
     *   }
     * })
     *
     */
    create<T extends VerificationCodeCreateArgs>(args: Prisma.SelectSubset<T, VerificationCodeCreateArgs<ExtArgs>>): Prisma.Prisma__VerificationCodeClient<runtime.Types.Result.GetResult<Prisma.$VerificationCodePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many VerificationCodes.
     * @param {VerificationCodeCreateManyArgs} args - Arguments to create many VerificationCodes.
     * @example
     * // Create many VerificationCodes
     * const verificationCode = await prisma.verificationCode.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends VerificationCodeCreateManyArgs>(args?: Prisma.SelectSubset<T, VerificationCodeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many VerificationCodes and returns the data saved in the database.
     * @param {VerificationCodeCreateManyAndReturnArgs} args - Arguments to create many VerificationCodes.
     * @example
     * // Create many VerificationCodes
     * const verificationCode = await prisma.verificationCode.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many VerificationCodes and only return the `id`
     * const verificationCodeWithIdOnly = await prisma.verificationCode.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends VerificationCodeCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, VerificationCodeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationCodePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a VerificationCode.
     * @param {VerificationCodeDeleteArgs} args - Arguments to delete one VerificationCode.
     * @example
     * // Delete one VerificationCode
     * const VerificationCode = await prisma.verificationCode.delete({
     *   where: {
     *     // ... filter to delete one VerificationCode
     *   }
     * })
     *
     */
    delete<T extends VerificationCodeDeleteArgs>(args: Prisma.SelectSubset<T, VerificationCodeDeleteArgs<ExtArgs>>): Prisma.Prisma__VerificationCodeClient<runtime.Types.Result.GetResult<Prisma.$VerificationCodePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one VerificationCode.
     * @param {VerificationCodeUpdateArgs} args - Arguments to update one VerificationCode.
     * @example
     * // Update one VerificationCode
     * const verificationCode = await prisma.verificationCode.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends VerificationCodeUpdateArgs>(args: Prisma.SelectSubset<T, VerificationCodeUpdateArgs<ExtArgs>>): Prisma.Prisma__VerificationCodeClient<runtime.Types.Result.GetResult<Prisma.$VerificationCodePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more VerificationCodes.
     * @param {VerificationCodeDeleteManyArgs} args - Arguments to filter VerificationCodes to delete.
     * @example
     * // Delete a few VerificationCodes
     * const { count } = await prisma.verificationCode.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends VerificationCodeDeleteManyArgs>(args?: Prisma.SelectSubset<T, VerificationCodeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more VerificationCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationCodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VerificationCodes
     * const verificationCode = await prisma.verificationCode.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends VerificationCodeUpdateManyArgs>(args: Prisma.SelectSubset<T, VerificationCodeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more VerificationCodes and returns the data updated in the database.
     * @param {VerificationCodeUpdateManyAndReturnArgs} args - Arguments to update many VerificationCodes.
     * @example
     * // Update many VerificationCodes
     * const verificationCode = await prisma.verificationCode.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more VerificationCodes and only return the `id`
     * const verificationCodeWithIdOnly = await prisma.verificationCode.updateManyAndReturn({
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
    updateManyAndReturn<T extends VerificationCodeUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, VerificationCodeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationCodePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one VerificationCode.
     * @param {VerificationCodeUpsertArgs} args - Arguments to update or create a VerificationCode.
     * @example
     * // Update or create a VerificationCode
     * const verificationCode = await prisma.verificationCode.upsert({
     *   create: {
     *     // ... data to create a VerificationCode
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VerificationCode we want to update
     *   }
     * })
     */
    upsert<T extends VerificationCodeUpsertArgs>(args: Prisma.SelectSubset<T, VerificationCodeUpsertArgs<ExtArgs>>): Prisma.Prisma__VerificationCodeClient<runtime.Types.Result.GetResult<Prisma.$VerificationCodePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of VerificationCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationCodeCountArgs} args - Arguments to filter VerificationCodes to count.
     * @example
     * // Count the number of VerificationCodes
     * const count = await prisma.verificationCode.count({
     *   where: {
     *     // ... the filter for the VerificationCodes we want to count
     *   }
     * })
    **/
    count<T extends VerificationCodeCountArgs>(args?: Prisma.Subset<T, VerificationCodeCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], VerificationCodeCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a VerificationCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationCodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends VerificationCodeAggregateArgs>(args: Prisma.Subset<T, VerificationCodeAggregateArgs>): Prisma.PrismaPromise<GetVerificationCodeAggregateType<T>>;
    /**
     * Group by VerificationCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationCodeGroupByArgs} args - Group by arguments.
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
    groupBy<T extends VerificationCodeGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: VerificationCodeGroupByArgs['orderBy'];
    } : {
        orderBy?: VerificationCodeGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, VerificationCodeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerificationCodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the VerificationCode model
     */
    readonly fields: VerificationCodeFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for VerificationCode.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__VerificationCodeClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the VerificationCode model
 */
export interface VerificationCodeFieldRefs {
    readonly id: Prisma.FieldRef<"VerificationCode", 'String'>;
    readonly email: Prisma.FieldRef<"VerificationCode", 'String'>;
    readonly mode: Prisma.FieldRef<"VerificationCode", 'VerificationCodeMode'>;
    readonly code: Prisma.FieldRef<"VerificationCode", 'String'>;
    readonly expirationDate: Prisma.FieldRef<"VerificationCode", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"VerificationCode", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"VerificationCode", 'DateTime'>;
}
/**
 * VerificationCode findUnique
 */
export type VerificationCodeFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationCode
     */
    select?: Prisma.VerificationCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationCode
     */
    omit?: Prisma.VerificationCodeOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationCode to fetch.
     */
    where: Prisma.VerificationCodeWhereUniqueInput;
};
/**
 * VerificationCode findUniqueOrThrow
 */
export type VerificationCodeFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationCode
     */
    select?: Prisma.VerificationCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationCode
     */
    omit?: Prisma.VerificationCodeOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationCode to fetch.
     */
    where: Prisma.VerificationCodeWhereUniqueInput;
};
/**
 * VerificationCode findFirst
 */
export type VerificationCodeFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationCode
     */
    select?: Prisma.VerificationCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationCode
     */
    omit?: Prisma.VerificationCodeOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationCode to fetch.
     */
    where?: Prisma.VerificationCodeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationCodes to fetch.
     */
    orderBy?: Prisma.VerificationCodeOrderByWithRelationInput | Prisma.VerificationCodeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for VerificationCodes.
     */
    cursor?: Prisma.VerificationCodeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationCodes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationCodes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VerificationCodes.
     */
    distinct?: Prisma.VerificationCodeScalarFieldEnum | Prisma.VerificationCodeScalarFieldEnum[];
};
/**
 * VerificationCode findFirstOrThrow
 */
export type VerificationCodeFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationCode
     */
    select?: Prisma.VerificationCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationCode
     */
    omit?: Prisma.VerificationCodeOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationCode to fetch.
     */
    where?: Prisma.VerificationCodeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationCodes to fetch.
     */
    orderBy?: Prisma.VerificationCodeOrderByWithRelationInput | Prisma.VerificationCodeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for VerificationCodes.
     */
    cursor?: Prisma.VerificationCodeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationCodes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationCodes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VerificationCodes.
     */
    distinct?: Prisma.VerificationCodeScalarFieldEnum | Prisma.VerificationCodeScalarFieldEnum[];
};
/**
 * VerificationCode findMany
 */
export type VerificationCodeFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationCode
     */
    select?: Prisma.VerificationCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationCode
     */
    omit?: Prisma.VerificationCodeOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationCodes to fetch.
     */
    where?: Prisma.VerificationCodeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationCodes to fetch.
     */
    orderBy?: Prisma.VerificationCodeOrderByWithRelationInput | Prisma.VerificationCodeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing VerificationCodes.
     */
    cursor?: Prisma.VerificationCodeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationCodes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationCodes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VerificationCodes.
     */
    distinct?: Prisma.VerificationCodeScalarFieldEnum | Prisma.VerificationCodeScalarFieldEnum[];
};
/**
 * VerificationCode create
 */
export type VerificationCodeCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationCode
     */
    select?: Prisma.VerificationCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationCode
     */
    omit?: Prisma.VerificationCodeOmit<ExtArgs> | null;
    /**
     * The data needed to create a VerificationCode.
     */
    data: Prisma.XOR<Prisma.VerificationCodeCreateInput, Prisma.VerificationCodeUncheckedCreateInput>;
};
/**
 * VerificationCode createMany
 */
export type VerificationCodeCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many VerificationCodes.
     */
    data: Prisma.VerificationCodeCreateManyInput | Prisma.VerificationCodeCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * VerificationCode createManyAndReturn
 */
export type VerificationCodeCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationCode
     */
    select?: Prisma.VerificationCodeSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationCode
     */
    omit?: Prisma.VerificationCodeOmit<ExtArgs> | null;
    /**
     * The data used to create many VerificationCodes.
     */
    data: Prisma.VerificationCodeCreateManyInput | Prisma.VerificationCodeCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * VerificationCode update
 */
export type VerificationCodeUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationCode
     */
    select?: Prisma.VerificationCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationCode
     */
    omit?: Prisma.VerificationCodeOmit<ExtArgs> | null;
    /**
     * The data needed to update a VerificationCode.
     */
    data: Prisma.XOR<Prisma.VerificationCodeUpdateInput, Prisma.VerificationCodeUncheckedUpdateInput>;
    /**
     * Choose, which VerificationCode to update.
     */
    where: Prisma.VerificationCodeWhereUniqueInput;
};
/**
 * VerificationCode updateMany
 */
export type VerificationCodeUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update VerificationCodes.
     */
    data: Prisma.XOR<Prisma.VerificationCodeUpdateManyMutationInput, Prisma.VerificationCodeUncheckedUpdateManyInput>;
    /**
     * Filter which VerificationCodes to update
     */
    where?: Prisma.VerificationCodeWhereInput;
    /**
     * Limit how many VerificationCodes to update.
     */
    limit?: number;
};
/**
 * VerificationCode updateManyAndReturn
 */
export type VerificationCodeUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationCode
     */
    select?: Prisma.VerificationCodeSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationCode
     */
    omit?: Prisma.VerificationCodeOmit<ExtArgs> | null;
    /**
     * The data used to update VerificationCodes.
     */
    data: Prisma.XOR<Prisma.VerificationCodeUpdateManyMutationInput, Prisma.VerificationCodeUncheckedUpdateManyInput>;
    /**
     * Filter which VerificationCodes to update
     */
    where?: Prisma.VerificationCodeWhereInput;
    /**
     * Limit how many VerificationCodes to update.
     */
    limit?: number;
};
/**
 * VerificationCode upsert
 */
export type VerificationCodeUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationCode
     */
    select?: Prisma.VerificationCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationCode
     */
    omit?: Prisma.VerificationCodeOmit<ExtArgs> | null;
    /**
     * The filter to search for the VerificationCode to update in case it exists.
     */
    where: Prisma.VerificationCodeWhereUniqueInput;
    /**
     * In case the VerificationCode found by the `where` argument doesn't exist, create a new VerificationCode with this data.
     */
    create: Prisma.XOR<Prisma.VerificationCodeCreateInput, Prisma.VerificationCodeUncheckedCreateInput>;
    /**
     * In case the VerificationCode was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.VerificationCodeUpdateInput, Prisma.VerificationCodeUncheckedUpdateInput>;
};
/**
 * VerificationCode delete
 */
export type VerificationCodeDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationCode
     */
    select?: Prisma.VerificationCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationCode
     */
    omit?: Prisma.VerificationCodeOmit<ExtArgs> | null;
    /**
     * Filter which VerificationCode to delete.
     */
    where: Prisma.VerificationCodeWhereUniqueInput;
};
/**
 * VerificationCode deleteMany
 */
export type VerificationCodeDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationCodes to delete
     */
    where?: Prisma.VerificationCodeWhereInput;
    /**
     * Limit how many VerificationCodes to delete.
     */
    limit?: number;
};
/**
 * VerificationCode without action
 */
export type VerificationCodeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationCode
     */
    select?: Prisma.VerificationCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationCode
     */
    omit?: Prisma.VerificationCodeOmit<ExtArgs> | null;
};
