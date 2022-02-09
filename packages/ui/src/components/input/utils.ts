import { isNumber } from 'lodash';

export function getNumberAttribute(value: string | number | undefined, fallback: number) {
  if (isNumber(value)) {
    return value;
  }
  const num = value ? Number(value) : fallback;
  if (Number.isNaN(num)) {
    return fallback;
  }

  return num;
}
