import { isArray, isObject, isString } from 'lodash';

export function getClassName(...args: unknown[]) {
  const className: string[] = [];

  const loop = (arr: unknown[]) => {
    arr.forEach((item) => {
      if (isArray(item)) {
        loop(item);
      } else if (isString(item)) {
        className.push(item);
      } else if (isObject(item)) {
        Object.keys(item).forEach((key) => {
          if (item[key]) {
            className.push(key);
          }
        });
      }
    });
  };
  loop(args);

  return className.join(' ');
}
