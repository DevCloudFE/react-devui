import { isNull, isObject, isString, isUndefined } from 'lodash';

export function getClassName(...args: any[]) {
  const className: string[] = [];

  args.forEach((item) => {
    if (isString(item)) {
      className.push(item);
    } else if (isObject(item)) {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== false && !isUndefined(value) && !isNull(value)) {
          className.push(key);
        }
      });
    }
  });

  return className.join(' ');
}
