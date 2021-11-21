import { isUndefined } from 'lodash';
import { useState } from 'react';

let id = 0;
export function getID() {
  return (id += 1);
}
export function useId(): number;
export function useId(size: number): number[];
export function useId(size?: number): number[] | number {
  const [id] = useState(() => getID());
  const [ids] = useState(() => Array(size).fill(getID()));

  return isUndefined(size) ? id : ids;
}
