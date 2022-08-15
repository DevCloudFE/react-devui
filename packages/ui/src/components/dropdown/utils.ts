import type { DId, DNestedChildren } from '../../utils';
import type { DDropdownItem } from './Dropdown';

export function checkEnableItem<ID extends DId, T extends DDropdownItem<ID>>(item: DNestedChildren<T>) {
  return (item.type === 'item' || item.type === 'sub') && !item.disabled;
}

export function getSameLevelItems<ID extends DId, T extends DDropdownItem<ID>>(arr: DNestedChildren<T>[]) {
  const items: DNestedChildren<T>[] = [];
  const reduceArr = (arr: DNestedChildren<T>[]) => {
    for (const item of arr) {
      if (item.type === 'group' && item.children) {
        reduceArr(item.children);
      } else if (checkEnableItem(item)) {
        items.push(item);
      }
    }
  };
  reduceArr(arr);
  return items;
}
