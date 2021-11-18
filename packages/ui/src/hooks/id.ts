import { isUndefined } from 'lodash';
import { useEffect } from 'react';
import { useImmer } from 'use-immer';

let id = 0;
export function getID() {
  return (id += 1);
}
export function useId(): number;
export function useId(size: number): number[];
export function useId(size?: number): number[] | number {
  const [id, setId] = useImmer(0);
  const [ids, setIds] = useImmer(Array(size).fill(0));

  useEffect(() => {
    if (isUndefined(size)) {
      setId(getID());
    } else {
      const arr: number[] = [];
      for (let n = 0; n < size; n++) {
        arr.push(getID());
      }
      setIds(arr);
    }
  }, [setId, setIds, size]);

  return isUndefined(size) ? id : ids;
}
