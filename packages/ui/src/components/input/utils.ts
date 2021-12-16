export function getNumberAttribute(value: string, fallback: number) {
  const _value = value ? Number(value) : fallback;
  if (Number.isNaN(_value)) {
    return fallback;
  }

  return _value;
}
