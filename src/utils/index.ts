export function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function randomFromArray<T>(arr: T[] | readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(" ");
}
