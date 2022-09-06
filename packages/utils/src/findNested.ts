import { isArray, isUndefined } from 'lodash';

export function findNested<T>(arr: T[], fn: (item: T) => boolean, nested = (item: T) => item['children']): T | undefined {
  let res: T | undefined;
  const reduceArr = (arr: T[]) => {
    for (const item of arr) {
      if (!isUndefined(res)) {
        break;
      }

      if (fn(item)) {
        res = item;
      } else {
        const children = nested(item);
        if (isArray(children)) {
          reduceArr(children);
        }
      }
    }
  };
  reduceArr(arr);

  return res;
}
