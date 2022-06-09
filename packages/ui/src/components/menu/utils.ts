import type { DId, DNestedChildren } from '../../utils/global';
import type { DMenuOption } from './Menu';

export function checkEnableOption<ID extends DId, T extends DMenuOption<ID>>(option: DNestedChildren<T>) {
  return (option.type === 'item' || option.type === 'sub') && !option.disabled;
}

export function getOptions<ID extends DId, T extends DMenuOption<ID>>(arr: DNestedChildren<T>[], _options?: DNestedChildren<T>[]) {
  const options = _options ?? [];
  arr.forEach((o) => {
    if (o.type === 'group') {
      if (o.children) {
        getOptions(o.children, options);
      }
    } else if (checkEnableOption(o)) {
      options.push(o);
    }
  });
  return options;
}
