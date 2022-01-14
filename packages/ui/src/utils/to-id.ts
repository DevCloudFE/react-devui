import { isNumber } from 'lodash';

export function toId(id: number): number;
export function toId(id: string): string;
export function toId(id: number | string) {
  if (isNumber(id)) {
    return id;
  }

  const _id = id
    .replace(/[A-Z]+/g, (match) => '-' + match.toLowerCase())
    .replace(/[0-9]+/g, (match) => '-' + match)
    .replace(/\s+/g, () => '-')
    .replace(/-+/g, () => '-');

  if (_id[0] === '-') {
    return _id.slice(1);
  }

  return _id;
}
