export function isInRoles(userRoles: string[], allowedRoles: string[]) {
  return userRoles.some((role) => allowedRoles.includes(role));
}
