export function first<T>(items: T[]): T | undefined {
  return items[0];
}

export function firstSure<T>(items: T[]): T {
  return items[0];
}
