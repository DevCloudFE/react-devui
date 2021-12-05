import { isString, isUndefined } from 'lodash';

export function mergeStyle(...styles: Array<React.CSSProperties | undefined>) {
  const mergeStyles: React.CSSProperties = {};

  styles.forEach((style) => {
    if (style) {
      for (const [key, value] of Object.entries(style)) {
        if (isUndefined(value)) {
          continue;
        }

        if (key in mergeStyles && isString(mergeStyles[key]) && isString(value)) {
          let newValue = [mergeStyles[key], value].join();
          if (CSS.supports(key, newValue)) {
            mergeStyles[key] = newValue;
            continue;
          }

          newValue = [mergeStyles[key], value].join(' ');
          if (CSS.supports(key, newValue)) {
            mergeStyles[key] = newValue;
            continue;
          }
        }

        mergeStyles[key] = value;
      }
    }
  });

  return mergeStyles;
}
