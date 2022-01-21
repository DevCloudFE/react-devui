import { isString, isUndefined } from 'lodash';

export function mergeStyle(target: React.CSSProperties, ...styles: Array<React.CSSProperties | undefined>) {
  const mergeStyles: React.CSSProperties = {};

  styles.forEach((style) => {
    if (style) {
      for (const [key, value] of Object.entries(style)) {
        if (isUndefined(value)) {
          continue;
        }

        if (!isUndefined(target[key])) {
          if (isString(target[key]) && isString(value)) {
            let newValue = [target[key], value].join();

            if (CSS.supports(key, newValue)) {
              mergeStyles[key] = newValue;
              continue;
            }

            newValue = [target[key], value].join(' ');
            if (CSS.supports(key, newValue)) {
              mergeStyles[key] = newValue;
              continue;
            }
          }
        } else {
          mergeStyles[key] = value;
        }
      }
    }
  });

  return Object.assign(target, mergeStyles);
}
