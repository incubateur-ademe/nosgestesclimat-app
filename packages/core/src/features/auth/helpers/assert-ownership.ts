import { ForbiddenException } from '../exceptions/forbidden.exception.ts'

export function assertOwnership(
  sessionUserId: string | undefined,
  resourceUserId: string
): void {
  if (!sessionUserId || sessionUserId !== resourceUserId) {
    throw new ForbiddenException({
      resourceId: resourceUserId,
    })
  }
}
