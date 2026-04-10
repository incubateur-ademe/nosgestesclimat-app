// See https://www.prisma.io/docs/orm/reference/error-reference
export enum PrismaErrorCodes {
  NotFound = 'P2025',
  UniqueConstraintFailed = 'P2002',
  ForeignKeyConstraintFailed = 'P2003',
  InconsistentColumnData = 'P2023',
}
