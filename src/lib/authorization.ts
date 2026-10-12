import type { UserRolesEnum } from '~/db/schema';

/**
 * Roles that may remove other members' announcements and comments.
 * Authors can always remove their own content without any role.
 */
export const CONTENT_MODERATOR_ROLES = [
  'admin',
] as const satisfies readonly UserRolesEnum[];

/** Roles that may create, change or delete entries in the shared course catalog. */
export const COURSE_CATALOG_MANAGER_ROLES = [
  'akademik',
  'admin',
] as const satisfies readonly UserRolesEnum[];

export interface Actor {
  id: string;
  roles: readonly string[];
}

/** Content may be deleted by its author or by a moderator. */
export function canDeleteContent(actor: Actor, creatorId: string): boolean {
  return (
    actor.id === creatorId ||
    actor.roles.some((role) =>
      (CONTENT_MODERATOR_ROLES as readonly string[]).includes(role),
    )
  );
}

/** Only the author may change what their content says; moderators remove, never rewrite. */
export function canEditContent(
  actor: Pick<Actor, 'id'>,
  creatorId: string,
): boolean {
  return actor.id === creatorId;
}
