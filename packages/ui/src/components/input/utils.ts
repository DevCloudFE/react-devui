export function getNumberAttribute(value: string, fallback: number) {
  const num = value ? Number(value) : fallback;
  if (Number.isNaN(num)) {
    return fallback;
  }

  return num;
}
