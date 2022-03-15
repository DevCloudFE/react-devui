import { isUndefined } from 'lodash';

export function findNested<T>(arr: T[], fn: (item: T) => boolean, key = 'children'): T | undefined {
  let res: T | undefined;
  const reduceArr = (arr: T[]) => {
    for (const item of arr) {
      if (!isUndefined(res)) {
        break;
      }

      if (fn(item)) {
        res = item;
      } else if (item[key]) {
        reduceArr(item[key]);
      }
    }
  };
  reduceArr(arr);

  return res;
}
