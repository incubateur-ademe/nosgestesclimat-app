import type * as runtime from "@prisma/client/runtime/client";
import * as $Enums from "./enums.ts";
import type * as Prisma from "./internal/prismaNamespace.ts";
export type UuidFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedUuidFilter<$PrismaModel> | string;
};
export type StringFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringFilter<$PrismaModel> | string;
};
export type FloatFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatFilter<$PrismaModel> | number;
};
export type JsonFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>, Required<JsonFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>;
export type JsonFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
};
export type JsonNullableFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>, Required<JsonNullableFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>;
export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
};
export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeFilter<$PrismaModel> | Date | string;
};
export type SortOrderInput = {
    sort: Prisma.SortOrder;
    nulls?: Prisma.NullsOrder;
};
export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedUuidWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedFloatFilter<$PrismaModel>;
    _min?: Prisma.NestedFloatFilter<$PrismaModel>;
    _max?: Prisma.NestedFloatFilter<$PrismaModel>;
};
export type JsonWithAggregatesFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>, Required<JsonWithAggregatesFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>;
export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedJsonFilter<$PrismaModel>;
    _max?: Prisma.NestedJsonFilter<$PrismaModel>;
};
export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>, Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>;
export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedJsonNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedJsonNullableFilter<$PrismaModel>;
};
export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeFilter<$PrismaModel>;
};
export type IntFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntFilter<$PrismaModel> | number;
};
export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedIntFilter<$PrismaModel>;
    _max?: Prisma.NestedIntFilter<$PrismaModel>;
};
export type EnumStatsKindFilter<$PrismaModel = never> = {
    equals?: $Enums.StatsKind | Prisma.EnumStatsKindFieldRefInput<$PrismaModel>;
    in?: $Enums.StatsKind[] | Prisma.ListEnumStatsKindFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatsKind[] | Prisma.ListEnumStatsKindFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatsKindFilter<$PrismaModel> | $Enums.StatsKind;
};
export type EnumStatsKindWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatsKind | Prisma.EnumStatsKindFieldRefInput<$PrismaModel>;
    in?: $Enums.StatsKind[] | Prisma.ListEnumStatsKindFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatsKind[] | Prisma.ListEnumStatsKindFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatsKindWithAggregatesFilter<$PrismaModel> | $Enums.StatsKind;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatsKindFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatsKindFilter<$PrismaModel>;
};
export type EnumApiScopeNameFilter<$PrismaModel = never> = {
    equals?: $Enums.ApiScopeName | Prisma.EnumApiScopeNameFieldRefInput<$PrismaModel>;
    in?: $Enums.ApiScopeName[] | Prisma.ListEnumApiScopeNameFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ApiScopeName[] | Prisma.ListEnumApiScopeNameFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumApiScopeNameFilter<$PrismaModel> | $Enums.ApiScopeName;
};
export type EnumApiScopeNameWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ApiScopeName | Prisma.EnumApiScopeNameFieldRefInput<$PrismaModel>;
    in?: $Enums.ApiScopeName[] | Prisma.ListEnumApiScopeNameFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ApiScopeName[] | Prisma.ListEnumApiScopeNameFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumApiScopeNameWithAggregatesFilter<$PrismaModel> | $Enums.ApiScopeName;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumApiScopeNameFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumApiScopeNameFilter<$PrismaModel>;
};
export type EnumJobStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | Prisma.EnumJobStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.JobStatus[] | Prisma.ListEnumJobStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.JobStatus[] | Prisma.ListEnumJobStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumJobStatusFilter<$PrismaModel> | $Enums.JobStatus;
};
export type EnumJobStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | Prisma.EnumJobStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.JobStatus[] | Prisma.ListEnumJobStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.JobStatus[] | Prisma.ListEnumJobStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumJobStatusWithAggregatesFilter<$PrismaModel> | $Enums.JobStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumJobStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumJobStatusFilter<$PrismaModel>;
};
export type EnumMatomoStatsSourceFilter<$PrismaModel = never> = {
    equals?: $Enums.MatomoStatsSource | Prisma.EnumMatomoStatsSourceFieldRefInput<$PrismaModel>;
    in?: $Enums.MatomoStatsSource[] | Prisma.ListEnumMatomoStatsSourceFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MatomoStatsSource[] | Prisma.ListEnumMatomoStatsSourceFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMatomoStatsSourceFilter<$PrismaModel> | $Enums.MatomoStatsSource;
};
export type EnumMatomoStatsDeviceFilter<$PrismaModel = never> = {
    equals?: $Enums.MatomoStatsDevice | Prisma.EnumMatomoStatsDeviceFieldRefInput<$PrismaModel>;
    in?: $Enums.MatomoStatsDevice[] | Prisma.ListEnumMatomoStatsDeviceFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MatomoStatsDevice[] | Prisma.ListEnumMatomoStatsDeviceFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMatomoStatsDeviceFilter<$PrismaModel> | $Enums.MatomoStatsDevice;
};
export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolFilter<$PrismaModel> | boolean;
};
export type EnumMatomoStatsSourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MatomoStatsSource | Prisma.EnumMatomoStatsSourceFieldRefInput<$PrismaModel>;
    in?: $Enums.MatomoStatsSource[] | Prisma.ListEnumMatomoStatsSourceFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MatomoStatsSource[] | Prisma.ListEnumMatomoStatsSourceFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMatomoStatsSourceWithAggregatesFilter<$PrismaModel> | $Enums.MatomoStatsSource;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumMatomoStatsSourceFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumMatomoStatsSourceFilter<$PrismaModel>;
};
export type EnumMatomoStatsDeviceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MatomoStatsDevice | Prisma.EnumMatomoStatsDeviceFieldRefInput<$PrismaModel>;
    in?: $Enums.MatomoStatsDevice[] | Prisma.ListEnumMatomoStatsDeviceFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MatomoStatsDevice[] | Prisma.ListEnumMatomoStatsDeviceFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMatomoStatsDeviceWithAggregatesFilter<$PrismaModel> | $Enums.MatomoStatsDevice;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumMatomoStatsDeviceFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumMatomoStatsDeviceFilter<$PrismaModel>;
};
export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedBoolFilter<$PrismaModel>;
    _max?: Prisma.NestedBoolFilter<$PrismaModel>;
};
export type EnumNorthstarRatingTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.NorthstarRatingType | Prisma.EnumNorthstarRatingTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.NorthstarRatingType[] | Prisma.ListEnumNorthstarRatingTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.NorthstarRatingType[] | Prisma.ListEnumNorthstarRatingTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumNorthstarRatingTypeFilter<$PrismaModel> | $Enums.NorthstarRatingType;
};
export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableFilter<$PrismaModel> | number | null;
};
export type EnumNorthstarRatingTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NorthstarRatingType | Prisma.EnumNorthstarRatingTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.NorthstarRatingType[] | Prisma.ListEnumNorthstarRatingTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.NorthstarRatingType[] | Prisma.ListEnumNorthstarRatingTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumNorthstarRatingTypeWithAggregatesFilter<$PrismaModel> | $Enums.NorthstarRatingType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumNorthstarRatingTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumNorthstarRatingTypeFilter<$PrismaModel>;
};
export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedIntNullableFilter<$PrismaModel>;
};
export type EnumOrganisationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganisationType | Prisma.EnumOrganisationTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.OrganisationType[] | Prisma.ListEnumOrganisationTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrganisationType[] | Prisma.ListEnumOrganisationTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrganisationTypeFilter<$PrismaModel> | $Enums.OrganisationType;
};
export type EnumOrganisationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganisationType | Prisma.EnumOrganisationTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.OrganisationType[] | Prisma.ListEnumOrganisationTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrganisationType[] | Prisma.ListEnumOrganisationTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrganisationTypeWithAggregatesFilter<$PrismaModel> | $Enums.OrganisationType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumOrganisationTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumOrganisationTypeFilter<$PrismaModel>;
};
export type EnumPollDefaultAdditionalQuestionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PollDefaultAdditionalQuestionType | Prisma.EnumPollDefaultAdditionalQuestionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.PollDefaultAdditionalQuestionType[] | Prisma.ListEnumPollDefaultAdditionalQuestionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PollDefaultAdditionalQuestionType[] | Prisma.ListEnumPollDefaultAdditionalQuestionTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPollDefaultAdditionalQuestionTypeFilter<$PrismaModel> | $Enums.PollDefaultAdditionalQuestionType;
};
export type EnumPollDefaultAdditionalQuestionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PollDefaultAdditionalQuestionType | Prisma.EnumPollDefaultAdditionalQuestionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.PollDefaultAdditionalQuestionType[] | Prisma.ListEnumPollDefaultAdditionalQuestionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PollDefaultAdditionalQuestionType[] | Prisma.ListEnumPollDefaultAdditionalQuestionTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPollDefaultAdditionalQuestionTypeWithAggregatesFilter<$PrismaModel> | $Enums.PollDefaultAdditionalQuestionType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPollDefaultAdditionalQuestionTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPollDefaultAdditionalQuestionTypeFilter<$PrismaModel>;
};
export type EnumQuizzAnswerIsAnswerCorrectFilter<$PrismaModel = never> = {
    equals?: $Enums.QuizzAnswerIsAnswerCorrect | Prisma.EnumQuizzAnswerIsAnswerCorrectFieldRefInput<$PrismaModel>;
    in?: $Enums.QuizzAnswerIsAnswerCorrect[] | Prisma.ListEnumQuizzAnswerIsAnswerCorrectFieldRefInput<$PrismaModel>;
    notIn?: $Enums.QuizzAnswerIsAnswerCorrect[] | Prisma.ListEnumQuizzAnswerIsAnswerCorrectFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumQuizzAnswerIsAnswerCorrectFilter<$PrismaModel> | $Enums.QuizzAnswerIsAnswerCorrect;
};
export type EnumQuizzAnswerIsAnswerCorrectWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QuizzAnswerIsAnswerCorrect | Prisma.EnumQuizzAnswerIsAnswerCorrectFieldRefInput<$PrismaModel>;
    in?: $Enums.QuizzAnswerIsAnswerCorrect[] | Prisma.ListEnumQuizzAnswerIsAnswerCorrectFieldRefInput<$PrismaModel>;
    notIn?: $Enums.QuizzAnswerIsAnswerCorrect[] | Prisma.ListEnumQuizzAnswerIsAnswerCorrectFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumQuizzAnswerIsAnswerCorrectWithAggregatesFilter<$PrismaModel> | $Enums.QuizzAnswerIsAnswerCorrect;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumQuizzAnswerIsAnswerCorrectFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumQuizzAnswerIsAnswerCorrectFilter<$PrismaModel>;
};
export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedUuidNullableFilter<$PrismaModel> | string | null;
};
export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringNullableFilter<$PrismaModel> | string | null;
};
export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    mode?: Prisma.QueryMode;
    not?: Prisma.NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type EnumSimulationAdditionalQuestionAnswerTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SimulationAdditionalQuestionAnswerType | Prisma.EnumSimulationAdditionalQuestionAnswerTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.SimulationAdditionalQuestionAnswerType[] | Prisma.ListEnumSimulationAdditionalQuestionAnswerTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SimulationAdditionalQuestionAnswerType[] | Prisma.ListEnumSimulationAdditionalQuestionAnswerTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSimulationAdditionalQuestionAnswerTypeFilter<$PrismaModel> | $Enums.SimulationAdditionalQuestionAnswerType;
};
export type EnumSimulationAdditionalQuestionAnswerTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SimulationAdditionalQuestionAnswerType | Prisma.EnumSimulationAdditionalQuestionAnswerTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.SimulationAdditionalQuestionAnswerType[] | Prisma.ListEnumSimulationAdditionalQuestionAnswerTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SimulationAdditionalQuestionAnswerType[] | Prisma.ListEnumSimulationAdditionalQuestionAnswerTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSimulationAdditionalQuestionAnswerTypeWithAggregatesFilter<$PrismaModel> | $Enums.SimulationAdditionalQuestionAnswerType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumSimulationAdditionalQuestionAnswerTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumSimulationAdditionalQuestionAnswerTypeFilter<$PrismaModel>;
};
export type EnumVerificationCodeModeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationCodeMode | Prisma.EnumVerificationCodeModeFieldRefInput<$PrismaModel> | null;
    in?: $Enums.VerificationCodeMode[] | Prisma.ListEnumVerificationCodeModeFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.VerificationCodeMode[] | Prisma.ListEnumVerificationCodeModeFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumVerificationCodeModeNullableFilter<$PrismaModel> | $Enums.VerificationCodeMode | null;
};
export type EnumVerificationCodeModeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationCodeMode | Prisma.EnumVerificationCodeModeFieldRefInput<$PrismaModel> | null;
    in?: $Enums.VerificationCodeMode[] | Prisma.ListEnumVerificationCodeModeFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.VerificationCodeMode[] | Prisma.ListEnumVerificationCodeModeFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumVerificationCodeModeNullableWithAggregatesFilter<$PrismaModel> | $Enums.VerificationCodeMode | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumVerificationCodeModeNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumVerificationCodeModeNullableFilter<$PrismaModel>;
};
export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedUuidFilter<$PrismaModel> | string;
};
export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringFilter<$PrismaModel> | string;
};
export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatFilter<$PrismaModel> | number;
};
export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeFilter<$PrismaModel> | Date | string;
};
export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedUuidWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntFilter<$PrismaModel> | number;
};
export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedStringFilter<$PrismaModel>;
    _max?: Prisma.NestedStringFilter<$PrismaModel>;
};
export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedFloatFilter<$PrismaModel>;
    _min?: Prisma.NestedFloatFilter<$PrismaModel>;
    _max?: Prisma.NestedFloatFilter<$PrismaModel>;
};
export type NestedJsonFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>, Required<NestedJsonFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>;
export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
};
export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableFilter<$PrismaModel> | number | null;
};
export type NestedJsonNullableFilter<$PrismaModel = never> = Prisma.PatchUndefined<Prisma.Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>, Required<NestedJsonNullableFilterBase<$PrismaModel>>> | Prisma.OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>;
export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
    path?: string[];
    mode?: Prisma.QueryMode | Prisma.EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    array_starts_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | null;
    lt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    lte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gt?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    gte?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel>;
    not?: runtime.InputJsonValue | Prisma.JsonFieldRefInput<$PrismaModel> | Prisma.JsonNullValueFilter;
};
export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedDateTimeFilter<$PrismaModel>;
    _max?: Prisma.NestedDateTimeFilter<$PrismaModel>;
};
export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntWithAggregatesFilter<$PrismaModel> | number;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedIntFilter<$PrismaModel>;
    _max?: Prisma.NestedIntFilter<$PrismaModel>;
};
export type NestedEnumStatsKindFilter<$PrismaModel = never> = {
    equals?: $Enums.StatsKind | Prisma.EnumStatsKindFieldRefInput<$PrismaModel>;
    in?: $Enums.StatsKind[] | Prisma.ListEnumStatsKindFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatsKind[] | Prisma.ListEnumStatsKindFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatsKindFilter<$PrismaModel> | $Enums.StatsKind;
};
export type NestedEnumStatsKindWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatsKind | Prisma.EnumStatsKindFieldRefInput<$PrismaModel>;
    in?: $Enums.StatsKind[] | Prisma.ListEnumStatsKindFieldRefInput<$PrismaModel>;
    notIn?: $Enums.StatsKind[] | Prisma.ListEnumStatsKindFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumStatsKindWithAggregatesFilter<$PrismaModel> | $Enums.StatsKind;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumStatsKindFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumStatsKindFilter<$PrismaModel>;
};
export type NestedEnumApiScopeNameFilter<$PrismaModel = never> = {
    equals?: $Enums.ApiScopeName | Prisma.EnumApiScopeNameFieldRefInput<$PrismaModel>;
    in?: $Enums.ApiScopeName[] | Prisma.ListEnumApiScopeNameFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ApiScopeName[] | Prisma.ListEnumApiScopeNameFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumApiScopeNameFilter<$PrismaModel> | $Enums.ApiScopeName;
};
export type NestedEnumApiScopeNameWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ApiScopeName | Prisma.EnumApiScopeNameFieldRefInput<$PrismaModel>;
    in?: $Enums.ApiScopeName[] | Prisma.ListEnumApiScopeNameFieldRefInput<$PrismaModel>;
    notIn?: $Enums.ApiScopeName[] | Prisma.ListEnumApiScopeNameFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumApiScopeNameWithAggregatesFilter<$PrismaModel> | $Enums.ApiScopeName;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumApiScopeNameFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumApiScopeNameFilter<$PrismaModel>;
};
export type NestedEnumJobStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | Prisma.EnumJobStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.JobStatus[] | Prisma.ListEnumJobStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.JobStatus[] | Prisma.ListEnumJobStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumJobStatusFilter<$PrismaModel> | $Enums.JobStatus;
};
export type NestedEnumJobStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | Prisma.EnumJobStatusFieldRefInput<$PrismaModel>;
    in?: $Enums.JobStatus[] | Prisma.ListEnumJobStatusFieldRefInput<$PrismaModel>;
    notIn?: $Enums.JobStatus[] | Prisma.ListEnumJobStatusFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumJobStatusWithAggregatesFilter<$PrismaModel> | $Enums.JobStatus;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumJobStatusFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumJobStatusFilter<$PrismaModel>;
};
export type NestedEnumMatomoStatsSourceFilter<$PrismaModel = never> = {
    equals?: $Enums.MatomoStatsSource | Prisma.EnumMatomoStatsSourceFieldRefInput<$PrismaModel>;
    in?: $Enums.MatomoStatsSource[] | Prisma.ListEnumMatomoStatsSourceFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MatomoStatsSource[] | Prisma.ListEnumMatomoStatsSourceFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMatomoStatsSourceFilter<$PrismaModel> | $Enums.MatomoStatsSource;
};
export type NestedEnumMatomoStatsDeviceFilter<$PrismaModel = never> = {
    equals?: $Enums.MatomoStatsDevice | Prisma.EnumMatomoStatsDeviceFieldRefInput<$PrismaModel>;
    in?: $Enums.MatomoStatsDevice[] | Prisma.ListEnumMatomoStatsDeviceFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MatomoStatsDevice[] | Prisma.ListEnumMatomoStatsDeviceFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMatomoStatsDeviceFilter<$PrismaModel> | $Enums.MatomoStatsDevice;
};
export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolFilter<$PrismaModel> | boolean;
};
export type NestedEnumMatomoStatsSourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MatomoStatsSource | Prisma.EnumMatomoStatsSourceFieldRefInput<$PrismaModel>;
    in?: $Enums.MatomoStatsSource[] | Prisma.ListEnumMatomoStatsSourceFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MatomoStatsSource[] | Prisma.ListEnumMatomoStatsSourceFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMatomoStatsSourceWithAggregatesFilter<$PrismaModel> | $Enums.MatomoStatsSource;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumMatomoStatsSourceFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumMatomoStatsSourceFilter<$PrismaModel>;
};
export type NestedEnumMatomoStatsDeviceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MatomoStatsDevice | Prisma.EnumMatomoStatsDeviceFieldRefInput<$PrismaModel>;
    in?: $Enums.MatomoStatsDevice[] | Prisma.ListEnumMatomoStatsDeviceFieldRefInput<$PrismaModel>;
    notIn?: $Enums.MatomoStatsDevice[] | Prisma.ListEnumMatomoStatsDeviceFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumMatomoStatsDeviceWithAggregatesFilter<$PrismaModel> | $Enums.MatomoStatsDevice;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumMatomoStatsDeviceFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumMatomoStatsDeviceFilter<$PrismaModel>;
};
export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedBoolFilter<$PrismaModel>;
    _max?: Prisma.NestedBoolFilter<$PrismaModel>;
};
export type NestedEnumNorthstarRatingTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.NorthstarRatingType | Prisma.EnumNorthstarRatingTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.NorthstarRatingType[] | Prisma.ListEnumNorthstarRatingTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.NorthstarRatingType[] | Prisma.ListEnumNorthstarRatingTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumNorthstarRatingTypeFilter<$PrismaModel> | $Enums.NorthstarRatingType;
};
export type NestedEnumNorthstarRatingTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NorthstarRatingType | Prisma.EnumNorthstarRatingTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.NorthstarRatingType[] | Prisma.ListEnumNorthstarRatingTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.NorthstarRatingType[] | Prisma.ListEnumNorthstarRatingTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumNorthstarRatingTypeWithAggregatesFilter<$PrismaModel> | $Enums.NorthstarRatingType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumNorthstarRatingTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumNorthstarRatingTypeFilter<$PrismaModel>;
};
export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.IntFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _avg?: Prisma.NestedFloatNullableFilter<$PrismaModel>;
    _sum?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedIntNullableFilter<$PrismaModel>;
};
export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | Prisma.FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | Prisma.ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    lte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gt?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    gte?: number | Prisma.FloatFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedFloatNullableFilter<$PrismaModel> | number | null;
};
export type NestedEnumOrganisationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganisationType | Prisma.EnumOrganisationTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.OrganisationType[] | Prisma.ListEnumOrganisationTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrganisationType[] | Prisma.ListEnumOrganisationTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrganisationTypeFilter<$PrismaModel> | $Enums.OrganisationType;
};
export type NestedEnumOrganisationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganisationType | Prisma.EnumOrganisationTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.OrganisationType[] | Prisma.ListEnumOrganisationTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OrganisationType[] | Prisma.ListEnumOrganisationTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumOrganisationTypeWithAggregatesFilter<$PrismaModel> | $Enums.OrganisationType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumOrganisationTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumOrganisationTypeFilter<$PrismaModel>;
};
export type NestedEnumPollDefaultAdditionalQuestionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PollDefaultAdditionalQuestionType | Prisma.EnumPollDefaultAdditionalQuestionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.PollDefaultAdditionalQuestionType[] | Prisma.ListEnumPollDefaultAdditionalQuestionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PollDefaultAdditionalQuestionType[] | Prisma.ListEnumPollDefaultAdditionalQuestionTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPollDefaultAdditionalQuestionTypeFilter<$PrismaModel> | $Enums.PollDefaultAdditionalQuestionType;
};
export type NestedEnumPollDefaultAdditionalQuestionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PollDefaultAdditionalQuestionType | Prisma.EnumPollDefaultAdditionalQuestionTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.PollDefaultAdditionalQuestionType[] | Prisma.ListEnumPollDefaultAdditionalQuestionTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.PollDefaultAdditionalQuestionType[] | Prisma.ListEnumPollDefaultAdditionalQuestionTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumPollDefaultAdditionalQuestionTypeWithAggregatesFilter<$PrismaModel> | $Enums.PollDefaultAdditionalQuestionType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumPollDefaultAdditionalQuestionTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumPollDefaultAdditionalQuestionTypeFilter<$PrismaModel>;
};
export type NestedEnumQuizzAnswerIsAnswerCorrectFilter<$PrismaModel = never> = {
    equals?: $Enums.QuizzAnswerIsAnswerCorrect | Prisma.EnumQuizzAnswerIsAnswerCorrectFieldRefInput<$PrismaModel>;
    in?: $Enums.QuizzAnswerIsAnswerCorrect[] | Prisma.ListEnumQuizzAnswerIsAnswerCorrectFieldRefInput<$PrismaModel>;
    notIn?: $Enums.QuizzAnswerIsAnswerCorrect[] | Prisma.ListEnumQuizzAnswerIsAnswerCorrectFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumQuizzAnswerIsAnswerCorrectFilter<$PrismaModel> | $Enums.QuizzAnswerIsAnswerCorrect;
};
export type NestedEnumQuizzAnswerIsAnswerCorrectWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QuizzAnswerIsAnswerCorrect | Prisma.EnumQuizzAnswerIsAnswerCorrectFieldRefInput<$PrismaModel>;
    in?: $Enums.QuizzAnswerIsAnswerCorrect[] | Prisma.ListEnumQuizzAnswerIsAnswerCorrectFieldRefInput<$PrismaModel>;
    notIn?: $Enums.QuizzAnswerIsAnswerCorrect[] | Prisma.ListEnumQuizzAnswerIsAnswerCorrectFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumQuizzAnswerIsAnswerCorrectWithAggregatesFilter<$PrismaModel> | $Enums.QuizzAnswerIsAnswerCorrect;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumQuizzAnswerIsAnswerCorrectFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumQuizzAnswerIsAnswerCorrectFilter<$PrismaModel>;
};
export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedUuidNullableFilter<$PrismaModel> | string | null;
};
export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringNullableFilter<$PrismaModel> | string | null;
};
export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    lte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gt?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    gte?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    contains?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedStringNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedStringNullableFilter<$PrismaModel>;
};
export type NestedEnumSimulationAdditionalQuestionAnswerTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SimulationAdditionalQuestionAnswerType | Prisma.EnumSimulationAdditionalQuestionAnswerTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.SimulationAdditionalQuestionAnswerType[] | Prisma.ListEnumSimulationAdditionalQuestionAnswerTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SimulationAdditionalQuestionAnswerType[] | Prisma.ListEnumSimulationAdditionalQuestionAnswerTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSimulationAdditionalQuestionAnswerTypeFilter<$PrismaModel> | $Enums.SimulationAdditionalQuestionAnswerType;
};
export type NestedEnumSimulationAdditionalQuestionAnswerTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SimulationAdditionalQuestionAnswerType | Prisma.EnumSimulationAdditionalQuestionAnswerTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.SimulationAdditionalQuestionAnswerType[] | Prisma.ListEnumSimulationAdditionalQuestionAnswerTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.SimulationAdditionalQuestionAnswerType[] | Prisma.ListEnumSimulationAdditionalQuestionAnswerTypeFieldRefInput<$PrismaModel>;
    not?: Prisma.NestedEnumSimulationAdditionalQuestionAnswerTypeWithAggregatesFilter<$PrismaModel> | $Enums.SimulationAdditionalQuestionAnswerType;
    _count?: Prisma.NestedIntFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumSimulationAdditionalQuestionAnswerTypeFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumSimulationAdditionalQuestionAnswerTypeFilter<$PrismaModel>;
};
export type NestedEnumVerificationCodeModeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationCodeMode | Prisma.EnumVerificationCodeModeFieldRefInput<$PrismaModel> | null;
    in?: $Enums.VerificationCodeMode[] | Prisma.ListEnumVerificationCodeModeFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.VerificationCodeMode[] | Prisma.ListEnumVerificationCodeModeFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumVerificationCodeModeNullableFilter<$PrismaModel> | $Enums.VerificationCodeMode | null;
};
export type NestedEnumVerificationCodeModeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.VerificationCodeMode | Prisma.EnumVerificationCodeModeFieldRefInput<$PrismaModel> | null;
    in?: $Enums.VerificationCodeMode[] | Prisma.ListEnumVerificationCodeModeFieldRefInput<$PrismaModel> | null;
    notIn?: $Enums.VerificationCodeMode[] | Prisma.ListEnumVerificationCodeModeFieldRefInput<$PrismaModel> | null;
    not?: Prisma.NestedEnumVerificationCodeModeNullableWithAggregatesFilter<$PrismaModel> | $Enums.VerificationCodeMode | null;
    _count?: Prisma.NestedIntNullableFilter<$PrismaModel>;
    _min?: Prisma.NestedEnumVerificationCodeModeNullableFilter<$PrismaModel>;
    _max?: Prisma.NestedEnumVerificationCodeModeNullableFilter<$PrismaModel>;
};
