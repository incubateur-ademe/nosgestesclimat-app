import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.ts";
import type * as Prisma from "../internal/prismaNamespace.ts";
/**
 * Model QuizzAnswer
 *
 */
export type QuizzAnswerModel = runtime.Types.Result.DefaultSelection<Prisma.$QuizzAnswerPayload>;
export type AggregateQuizzAnswer = {
    _count: QuizzAnswerCountAggregateOutputType | null;
    _min: QuizzAnswerMinAggregateOutputType | null;
    _max: QuizzAnswerMaxAggregateOutputType | null;
};
export type QuizzAnswerMinAggregateOutputType = {
    id: string | null;
    simulationId: string | null;
    isAnswerCorrect: $Enums.QuizzAnswerIsAnswerCorrect | null;
    answer: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type QuizzAnswerMaxAggregateOutputType = {
    id: string | null;
    simulationId: string | null;
    isAnswerCorrect: $Enums.QuizzAnswerIsAnswerCorrect | null;
    answer: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type QuizzAnswerCountAggregateOutputType = {
    id: number;
    simulationId: number;
    isAnswerCorrect: number;
    answer: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type QuizzAnswerMinAggregateInputType = {
    id?: true;
    simulationId?: true;
    isAnswerCorrect?: true;
    answer?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type QuizzAnswerMaxAggregateInputType = {
    id?: true;
    simulationId?: true;
    isAnswerCorrect?: true;
    answer?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type QuizzAnswerCountAggregateInputType = {
    id?: true;
    simulationId?: true;
    isAnswerCorrect?: true;
    answer?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type QuizzAnswerAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which QuizzAnswer to aggregate.
     */
    where?: Prisma.QuizzAnswerWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of QuizzAnswers to fetch.
     */
    orderBy?: Prisma.QuizzAnswerOrderByWithRelationInput | Prisma.QuizzAnswerOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.QuizzAnswerWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` QuizzAnswers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` QuizzAnswers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned QuizzAnswers
    **/
    _count?: true | QuizzAnswerCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: QuizzAnswerMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: QuizzAnswerMaxAggregateInputType;
};
export type GetQuizzAnswerAggregateType<T extends QuizzAnswerAggregateArgs> = {
    [P in keyof T & keyof AggregateQuizzAnswer]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateQuizzAnswer[P]> : Prisma.GetScalarType<T[P], AggregateQuizzAnswer[P]>;
};
export type QuizzAnswerGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.QuizzAnswerWhereInput;
    orderBy?: Prisma.QuizzAnswerOrderByWithAggregationInput | Prisma.QuizzAnswerOrderByWithAggregationInput[];
    by: Prisma.QuizzAnswerScalarFieldEnum[] | Prisma.QuizzAnswerScalarFieldEnum;
    having?: Prisma.QuizzAnswerScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: QuizzAnswerCountAggregateInputType | true;
    _min?: QuizzAnswerMinAggregateInputType;
    _max?: QuizzAnswerMaxAggregateInputType;
};
export type QuizzAnswerGroupByOutputType = {
    id: string;
    simulationId: string;
    isAnswerCorrect: $Enums.QuizzAnswerIsAnswerCorrect;
    answer: string;
    createdAt: Date;
    updatedAt: Date;
    _count: QuizzAnswerCountAggregateOutputType | null;
    _min: QuizzAnswerMinAggregateOutputType | null;
    _max: QuizzAnswerMaxAggregateOutputType | null;
};
export type GetQuizzAnswerGroupByPayload<T extends QuizzAnswerGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<QuizzAnswerGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof QuizzAnswerGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], QuizzAnswerGroupByOutputType[P]> : Prisma.GetScalarType<T[P], QuizzAnswerGroupByOutputType[P]>;
}>>;
export type QuizzAnswerWhereInput = {
    AND?: Prisma.QuizzAnswerWhereInput | Prisma.QuizzAnswerWhereInput[];
    OR?: Prisma.QuizzAnswerWhereInput[];
    NOT?: Prisma.QuizzAnswerWhereInput | Prisma.QuizzAnswerWhereInput[];
    id?: Prisma.StringFilter<"QuizzAnswer"> | string;
    simulationId?: Prisma.UuidFilter<"QuizzAnswer"> | string;
    isAnswerCorrect?: Prisma.EnumQuizzAnswerIsAnswerCorrectFilter<"QuizzAnswer"> | $Enums.QuizzAnswerIsAnswerCorrect;
    answer?: Prisma.StringFilter<"QuizzAnswer"> | string;
    createdAt?: Prisma.DateTimeFilter<"QuizzAnswer"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"QuizzAnswer"> | Date | string;
};
export type QuizzAnswerOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    isAnswerCorrect?: Prisma.SortOrder;
    answer?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type QuizzAnswerWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    simulationId_answer?: Prisma.QuizzAnswerSimulationIdAnswerCompoundUniqueInput;
    AND?: Prisma.QuizzAnswerWhereInput | Prisma.QuizzAnswerWhereInput[];
    OR?: Prisma.QuizzAnswerWhereInput[];
    NOT?: Prisma.QuizzAnswerWhereInput | Prisma.QuizzAnswerWhereInput[];
    simulationId?: Prisma.UuidFilter<"QuizzAnswer"> | string;
    isAnswerCorrect?: Prisma.EnumQuizzAnswerIsAnswerCorrectFilter<"QuizzAnswer"> | $Enums.QuizzAnswerIsAnswerCorrect;
    answer?: Prisma.StringFilter<"QuizzAnswer"> | string;
    createdAt?: Prisma.DateTimeFilter<"QuizzAnswer"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"QuizzAnswer"> | Date | string;
}, "id" | "simulationId_answer">;
export type QuizzAnswerOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    isAnswerCorrect?: Prisma.SortOrder;
    answer?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.QuizzAnswerCountOrderByAggregateInput;
    _max?: Prisma.QuizzAnswerMaxOrderByAggregateInput;
    _min?: Prisma.QuizzAnswerMinOrderByAggregateInput;
};
export type QuizzAnswerScalarWhereWithAggregatesInput = {
    AND?: Prisma.QuizzAnswerScalarWhereWithAggregatesInput | Prisma.QuizzAnswerScalarWhereWithAggregatesInput[];
    OR?: Prisma.QuizzAnswerScalarWhereWithAggregatesInput[];
    NOT?: Prisma.QuizzAnswerScalarWhereWithAggregatesInput | Prisma.QuizzAnswerScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"QuizzAnswer"> | string;
    simulationId?: Prisma.UuidWithAggregatesFilter<"QuizzAnswer"> | string;
    isAnswerCorrect?: Prisma.EnumQuizzAnswerIsAnswerCorrectWithAggregatesFilter<"QuizzAnswer"> | $Enums.QuizzAnswerIsAnswerCorrect;
    answer?: Prisma.StringWithAggregatesFilter<"QuizzAnswer"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"QuizzAnswer"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"QuizzAnswer"> | Date | string;
};
export type QuizzAnswerCreateInput = {
    id?: string;
    simulationId: string;
    isAnswerCorrect: $Enums.QuizzAnswerIsAnswerCorrect;
    answer: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type QuizzAnswerUncheckedCreateInput = {
    id?: string;
    simulationId: string;
    isAnswerCorrect: $Enums.QuizzAnswerIsAnswerCorrect;
    answer: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type QuizzAnswerUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    simulationId?: Prisma.StringFieldUpdateOperationsInput | string;
    isAnswerCorrect?: Prisma.EnumQuizzAnswerIsAnswerCorrectFieldUpdateOperationsInput | $Enums.QuizzAnswerIsAnswerCorrect;
    answer?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type QuizzAnswerUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    simulationId?: Prisma.StringFieldUpdateOperationsInput | string;
    isAnswerCorrect?: Prisma.EnumQuizzAnswerIsAnswerCorrectFieldUpdateOperationsInput | $Enums.QuizzAnswerIsAnswerCorrect;
    answer?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type QuizzAnswerCreateManyInput = {
    id?: string;
    simulationId: string;
    isAnswerCorrect: $Enums.QuizzAnswerIsAnswerCorrect;
    answer: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type QuizzAnswerUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    simulationId?: Prisma.StringFieldUpdateOperationsInput | string;
    isAnswerCorrect?: Prisma.EnumQuizzAnswerIsAnswerCorrectFieldUpdateOperationsInput | $Enums.QuizzAnswerIsAnswerCorrect;
    answer?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type QuizzAnswerUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    simulationId?: Prisma.StringFieldUpdateOperationsInput | string;
    isAnswerCorrect?: Prisma.EnumQuizzAnswerIsAnswerCorrectFieldUpdateOperationsInput | $Enums.QuizzAnswerIsAnswerCorrect;
    answer?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type QuizzAnswerSimulationIdAnswerCompoundUniqueInput = {
    simulationId: string;
    answer: string;
};
export type QuizzAnswerCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    isAnswerCorrect?: Prisma.SortOrder;
    answer?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type QuizzAnswerMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    isAnswerCorrect?: Prisma.SortOrder;
    answer?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type QuizzAnswerMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    simulationId?: Prisma.SortOrder;
    isAnswerCorrect?: Prisma.SortOrder;
    answer?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type EnumQuizzAnswerIsAnswerCorrectFieldUpdateOperationsInput = {
    set?: $Enums.QuizzAnswerIsAnswerCorrect;
};
export type QuizzAnswerSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    simulationId?: boolean;
    isAnswerCorrect?: boolean;
    answer?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["quizzAnswer"]>;
export type QuizzAnswerSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    simulationId?: boolean;
    isAnswerCorrect?: boolean;
    answer?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["quizzAnswer"]>;
export type QuizzAnswerSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    simulationId?: boolean;
    isAnswerCorrect?: boolean;
    answer?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["quizzAnswer"]>;
export type QuizzAnswerSelectScalar = {
    id?: boolean;
    simulationId?: boolean;
    isAnswerCorrect?: boolean;
    answer?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type QuizzAnswerOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "simulationId" | "isAnswerCorrect" | "answer" | "createdAt" | "updatedAt", ExtArgs["result"]["quizzAnswer"]>;
export type $QuizzAnswerPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "QuizzAnswer";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        simulationId: string;
        isAnswerCorrect: $Enums.QuizzAnswerIsAnswerCorrect;
        answer: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["quizzAnswer"]>;
    composites: {};
};
export type QuizzAnswerGetPayload<S extends boolean | null | undefined | QuizzAnswerDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$QuizzAnswerPayload, S>;
export type QuizzAnswerCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<QuizzAnswerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: QuizzAnswerCountAggregateInputType | true;
};
export interface QuizzAnswerDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['QuizzAnswer'];
        meta: {
            name: 'QuizzAnswer';
        };
    };
    /**
     * Find zero or one QuizzAnswer that matches the filter.
     * @param {QuizzAnswerFindUniqueArgs} args - Arguments to find a QuizzAnswer
     * @example
     * // Get one QuizzAnswer
     * const quizzAnswer = await prisma.quizzAnswer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends QuizzAnswerFindUniqueArgs>(args: Prisma.SelectSubset<T, QuizzAnswerFindUniqueArgs<ExtArgs>>): Prisma.Prisma__QuizzAnswerClient<runtime.Types.Result.GetResult<Prisma.$QuizzAnswerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one QuizzAnswer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {QuizzAnswerFindUniqueOrThrowArgs} args - Arguments to find a QuizzAnswer
     * @example
     * // Get one QuizzAnswer
     * const quizzAnswer = await prisma.quizzAnswer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends QuizzAnswerFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, QuizzAnswerFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__QuizzAnswerClient<runtime.Types.Result.GetResult<Prisma.$QuizzAnswerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first QuizzAnswer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuizzAnswerFindFirstArgs} args - Arguments to find a QuizzAnswer
     * @example
     * // Get one QuizzAnswer
     * const quizzAnswer = await prisma.quizzAnswer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends QuizzAnswerFindFirstArgs>(args?: Prisma.SelectSubset<T, QuizzAnswerFindFirstArgs<ExtArgs>>): Prisma.Prisma__QuizzAnswerClient<runtime.Types.Result.GetResult<Prisma.$QuizzAnswerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first QuizzAnswer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuizzAnswerFindFirstOrThrowArgs} args - Arguments to find a QuizzAnswer
     * @example
     * // Get one QuizzAnswer
     * const quizzAnswer = await prisma.quizzAnswer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends QuizzAnswerFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, QuizzAnswerFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__QuizzAnswerClient<runtime.Types.Result.GetResult<Prisma.$QuizzAnswerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more QuizzAnswers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuizzAnswerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all QuizzAnswers
     * const quizzAnswers = await prisma.quizzAnswer.findMany()
     *
     * // Get first 10 QuizzAnswers
     * const quizzAnswers = await prisma.quizzAnswer.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const quizzAnswerWithIdOnly = await prisma.quizzAnswer.findMany({ select: { id: true } })
     *
     */
    findMany<T extends QuizzAnswerFindManyArgs>(args?: Prisma.SelectSubset<T, QuizzAnswerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$QuizzAnswerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a QuizzAnswer.
     * @param {QuizzAnswerCreateArgs} args - Arguments to create a QuizzAnswer.
     * @example
     * // Create one QuizzAnswer
     * const QuizzAnswer = await prisma.quizzAnswer.create({
     *   data: {
     *     // ... data to create a QuizzAnswer
     *   }
     * })
     *
     */
    create<T extends QuizzAnswerCreateArgs>(args: Prisma.SelectSubset<T, QuizzAnswerCreateArgs<ExtArgs>>): Prisma.Prisma__QuizzAnswerClient<runtime.Types.Result.GetResult<Prisma.$QuizzAnswerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many QuizzAnswers.
     * @param {QuizzAnswerCreateManyArgs} args - Arguments to create many QuizzAnswers.
     * @example
     * // Create many QuizzAnswers
     * const quizzAnswer = await prisma.quizzAnswer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends QuizzAnswerCreateManyArgs>(args?: Prisma.SelectSubset<T, QuizzAnswerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many QuizzAnswers and returns the data saved in the database.
     * @param {QuizzAnswerCreateManyAndReturnArgs} args - Arguments to create many QuizzAnswers.
     * @example
     * // Create many QuizzAnswers
     * const quizzAnswer = await prisma.quizzAnswer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many QuizzAnswers and only return the `id`
     * const quizzAnswerWithIdOnly = await prisma.quizzAnswer.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends QuizzAnswerCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, QuizzAnswerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$QuizzAnswerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a QuizzAnswer.
     * @param {QuizzAnswerDeleteArgs} args - Arguments to delete one QuizzAnswer.
     * @example
     * // Delete one QuizzAnswer
     * const QuizzAnswer = await prisma.quizzAnswer.delete({
     *   where: {
     *     // ... filter to delete one QuizzAnswer
     *   }
     * })
     *
     */
    delete<T extends QuizzAnswerDeleteArgs>(args: Prisma.SelectSubset<T, QuizzAnswerDeleteArgs<ExtArgs>>): Prisma.Prisma__QuizzAnswerClient<runtime.Types.Result.GetResult<Prisma.$QuizzAnswerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one QuizzAnswer.
     * @param {QuizzAnswerUpdateArgs} args - Arguments to update one QuizzAnswer.
     * @example
     * // Update one QuizzAnswer
     * const quizzAnswer = await prisma.quizzAnswer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends QuizzAnswerUpdateArgs>(args: Prisma.SelectSubset<T, QuizzAnswerUpdateArgs<ExtArgs>>): Prisma.Prisma__QuizzAnswerClient<runtime.Types.Result.GetResult<Prisma.$QuizzAnswerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more QuizzAnswers.
     * @param {QuizzAnswerDeleteManyArgs} args - Arguments to filter QuizzAnswers to delete.
     * @example
     * // Delete a few QuizzAnswers
     * const { count } = await prisma.quizzAnswer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends QuizzAnswerDeleteManyArgs>(args?: Prisma.SelectSubset<T, QuizzAnswerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more QuizzAnswers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuizzAnswerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many QuizzAnswers
     * const quizzAnswer = await prisma.quizzAnswer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends QuizzAnswerUpdateManyArgs>(args: Prisma.SelectSubset<T, QuizzAnswerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more QuizzAnswers and returns the data updated in the database.
     * @param {QuizzAnswerUpdateManyAndReturnArgs} args - Arguments to update many QuizzAnswers.
     * @example
     * // Update many QuizzAnswers
     * const quizzAnswer = await prisma.quizzAnswer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more QuizzAnswers and only return the `id`
     * const quizzAnswerWithIdOnly = await prisma.quizzAnswer.updateManyAndReturn({
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
    updateManyAndReturn<T extends QuizzAnswerUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, QuizzAnswerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$QuizzAnswerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one QuizzAnswer.
     * @param {QuizzAnswerUpsertArgs} args - Arguments to update or create a QuizzAnswer.
     * @example
     * // Update or create a QuizzAnswer
     * const quizzAnswer = await prisma.quizzAnswer.upsert({
     *   create: {
     *     // ... data to create a QuizzAnswer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the QuizzAnswer we want to update
     *   }
     * })
     */
    upsert<T extends QuizzAnswerUpsertArgs>(args: Prisma.SelectSubset<T, QuizzAnswerUpsertArgs<ExtArgs>>): Prisma.Prisma__QuizzAnswerClient<runtime.Types.Result.GetResult<Prisma.$QuizzAnswerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of QuizzAnswers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuizzAnswerCountArgs} args - Arguments to filter QuizzAnswers to count.
     * @example
     * // Count the number of QuizzAnswers
     * const count = await prisma.quizzAnswer.count({
     *   where: {
     *     // ... the filter for the QuizzAnswers we want to count
     *   }
     * })
    **/
    count<T extends QuizzAnswerCountArgs>(args?: Prisma.Subset<T, QuizzAnswerCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], QuizzAnswerCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a QuizzAnswer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuizzAnswerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends QuizzAnswerAggregateArgs>(args: Prisma.Subset<T, QuizzAnswerAggregateArgs>): Prisma.PrismaPromise<GetQuizzAnswerAggregateType<T>>;
    /**
     * Group by QuizzAnswer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QuizzAnswerGroupByArgs} args - Group by arguments.
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
    groupBy<T extends QuizzAnswerGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: QuizzAnswerGroupByArgs['orderBy'];
    } : {
        orderBy?: QuizzAnswerGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, QuizzAnswerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetQuizzAnswerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the QuizzAnswer model
     */
    readonly fields: QuizzAnswerFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for QuizzAnswer.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__QuizzAnswerClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the QuizzAnswer model
 */
export interface QuizzAnswerFieldRefs {
    readonly id: Prisma.FieldRef<"QuizzAnswer", 'String'>;
    readonly simulationId: Prisma.FieldRef<"QuizzAnswer", 'String'>;
    readonly isAnswerCorrect: Prisma.FieldRef<"QuizzAnswer", 'QuizzAnswerIsAnswerCorrect'>;
    readonly answer: Prisma.FieldRef<"QuizzAnswer", 'String'>;
    readonly createdAt: Prisma.FieldRef<"QuizzAnswer", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"QuizzAnswer", 'DateTime'>;
}
/**
 * QuizzAnswer findUnique
 */
export type QuizzAnswerFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuizzAnswer
     */
    select?: Prisma.QuizzAnswerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QuizzAnswer
     */
    omit?: Prisma.QuizzAnswerOmit<ExtArgs> | null;
    /**
     * Filter, which QuizzAnswer to fetch.
     */
    where: Prisma.QuizzAnswerWhereUniqueInput;
};
/**
 * QuizzAnswer findUniqueOrThrow
 */
export type QuizzAnswerFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuizzAnswer
     */
    select?: Prisma.QuizzAnswerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QuizzAnswer
     */
    omit?: Prisma.QuizzAnswerOmit<ExtArgs> | null;
    /**
     * Filter, which QuizzAnswer to fetch.
     */
    where: Prisma.QuizzAnswerWhereUniqueInput;
};
/**
 * QuizzAnswer findFirst
 */
export type QuizzAnswerFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuizzAnswer
     */
    select?: Prisma.QuizzAnswerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QuizzAnswer
     */
    omit?: Prisma.QuizzAnswerOmit<ExtArgs> | null;
    /**
     * Filter, which QuizzAnswer to fetch.
     */
    where?: Prisma.QuizzAnswerWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of QuizzAnswers to fetch.
     */
    orderBy?: Prisma.QuizzAnswerOrderByWithRelationInput | Prisma.QuizzAnswerOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for QuizzAnswers.
     */
    cursor?: Prisma.QuizzAnswerWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` QuizzAnswers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` QuizzAnswers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of QuizzAnswers.
     */
    distinct?: Prisma.QuizzAnswerScalarFieldEnum | Prisma.QuizzAnswerScalarFieldEnum[];
};
/**
 * QuizzAnswer findFirstOrThrow
 */
export type QuizzAnswerFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuizzAnswer
     */
    select?: Prisma.QuizzAnswerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QuizzAnswer
     */
    omit?: Prisma.QuizzAnswerOmit<ExtArgs> | null;
    /**
     * Filter, which QuizzAnswer to fetch.
     */
    where?: Prisma.QuizzAnswerWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of QuizzAnswers to fetch.
     */
    orderBy?: Prisma.QuizzAnswerOrderByWithRelationInput | Prisma.QuizzAnswerOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for QuizzAnswers.
     */
    cursor?: Prisma.QuizzAnswerWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` QuizzAnswers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` QuizzAnswers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of QuizzAnswers.
     */
    distinct?: Prisma.QuizzAnswerScalarFieldEnum | Prisma.QuizzAnswerScalarFieldEnum[];
};
/**
 * QuizzAnswer findMany
 */
export type QuizzAnswerFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuizzAnswer
     */
    select?: Prisma.QuizzAnswerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QuizzAnswer
     */
    omit?: Prisma.QuizzAnswerOmit<ExtArgs> | null;
    /**
     * Filter, which QuizzAnswers to fetch.
     */
    where?: Prisma.QuizzAnswerWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of QuizzAnswers to fetch.
     */
    orderBy?: Prisma.QuizzAnswerOrderByWithRelationInput | Prisma.QuizzAnswerOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing QuizzAnswers.
     */
    cursor?: Prisma.QuizzAnswerWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` QuizzAnswers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` QuizzAnswers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of QuizzAnswers.
     */
    distinct?: Prisma.QuizzAnswerScalarFieldEnum | Prisma.QuizzAnswerScalarFieldEnum[];
};
/**
 * QuizzAnswer create
 */
export type QuizzAnswerCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuizzAnswer
     */
    select?: Prisma.QuizzAnswerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QuizzAnswer
     */
    omit?: Prisma.QuizzAnswerOmit<ExtArgs> | null;
    /**
     * The data needed to create a QuizzAnswer.
     */
    data: Prisma.XOR<Prisma.QuizzAnswerCreateInput, Prisma.QuizzAnswerUncheckedCreateInput>;
};
/**
 * QuizzAnswer createMany
 */
export type QuizzAnswerCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many QuizzAnswers.
     */
    data: Prisma.QuizzAnswerCreateManyInput | Prisma.QuizzAnswerCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * QuizzAnswer createManyAndReturn
 */
export type QuizzAnswerCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuizzAnswer
     */
    select?: Prisma.QuizzAnswerSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the QuizzAnswer
     */
    omit?: Prisma.QuizzAnswerOmit<ExtArgs> | null;
    /**
     * The data used to create many QuizzAnswers.
     */
    data: Prisma.QuizzAnswerCreateManyInput | Prisma.QuizzAnswerCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * QuizzAnswer update
 */
export type QuizzAnswerUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuizzAnswer
     */
    select?: Prisma.QuizzAnswerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QuizzAnswer
     */
    omit?: Prisma.QuizzAnswerOmit<ExtArgs> | null;
    /**
     * The data needed to update a QuizzAnswer.
     */
    data: Prisma.XOR<Prisma.QuizzAnswerUpdateInput, Prisma.QuizzAnswerUncheckedUpdateInput>;
    /**
     * Choose, which QuizzAnswer to update.
     */
    where: Prisma.QuizzAnswerWhereUniqueInput;
};
/**
 * QuizzAnswer updateMany
 */
export type QuizzAnswerUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update QuizzAnswers.
     */
    data: Prisma.XOR<Prisma.QuizzAnswerUpdateManyMutationInput, Prisma.QuizzAnswerUncheckedUpdateManyInput>;
    /**
     * Filter which QuizzAnswers to update
     */
    where?: Prisma.QuizzAnswerWhereInput;
    /**
     * Limit how many QuizzAnswers to update.
     */
    limit?: number;
};
/**
 * QuizzAnswer updateManyAndReturn
 */
export type QuizzAnswerUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuizzAnswer
     */
    select?: Prisma.QuizzAnswerSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the QuizzAnswer
     */
    omit?: Prisma.QuizzAnswerOmit<ExtArgs> | null;
    /**
     * The data used to update QuizzAnswers.
     */
    data: Prisma.XOR<Prisma.QuizzAnswerUpdateManyMutationInput, Prisma.QuizzAnswerUncheckedUpdateManyInput>;
    /**
     * Filter which QuizzAnswers to update
     */
    where?: Prisma.QuizzAnswerWhereInput;
    /**
     * Limit how many QuizzAnswers to update.
     */
    limit?: number;
};
/**
 * QuizzAnswer upsert
 */
export type QuizzAnswerUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuizzAnswer
     */
    select?: Prisma.QuizzAnswerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QuizzAnswer
     */
    omit?: Prisma.QuizzAnswerOmit<ExtArgs> | null;
    /**
     * The filter to search for the QuizzAnswer to update in case it exists.
     */
    where: Prisma.QuizzAnswerWhereUniqueInput;
    /**
     * In case the QuizzAnswer found by the `where` argument doesn't exist, create a new QuizzAnswer with this data.
     */
    create: Prisma.XOR<Prisma.QuizzAnswerCreateInput, Prisma.QuizzAnswerUncheckedCreateInput>;
    /**
     * In case the QuizzAnswer was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.QuizzAnswerUpdateInput, Prisma.QuizzAnswerUncheckedUpdateInput>;
};
/**
 * QuizzAnswer delete
 */
export type QuizzAnswerDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuizzAnswer
     */
    select?: Prisma.QuizzAnswerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QuizzAnswer
     */
    omit?: Prisma.QuizzAnswerOmit<ExtArgs> | null;
    /**
     * Filter which QuizzAnswer to delete.
     */
    where: Prisma.QuizzAnswerWhereUniqueInput;
};
/**
 * QuizzAnswer deleteMany
 */
export type QuizzAnswerDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which QuizzAnswers to delete
     */
    where?: Prisma.QuizzAnswerWhereInput;
    /**
     * Limit how many QuizzAnswers to delete.
     */
    limit?: number;
};
/**
 * QuizzAnswer without action
 */
export type QuizzAnswerDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QuizzAnswer
     */
    select?: Prisma.QuizzAnswerSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QuizzAnswer
     */
    omit?: Prisma.QuizzAnswerOmit<ExtArgs> | null;
};
