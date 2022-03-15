import type { DId, DNestedChildren } from '../../types';
import type { DDropdownOption } from './Dropdown';

export function checkEnableOption<ID extends DId, T extends DDropdownOption<ID>>(option: DNestedChildren<T>) {
  return (option.type === 'item' || option.type === 'sub') && !option.disabled;
}

export function getOptions<ID extends DId, T extends DDropdownOption<ID>>(arr: DNestedChildren<T>[], _options?: DNestedChildren<T>[]) {
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
