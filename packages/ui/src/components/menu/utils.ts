import type { DId, DNestedChildren } from '../../utils/global';
import type { DMenuItem } from './Menu';

export function checkEnableItem<ID extends DId, T extends DMenuItem<ID>>(item: DNestedChildren<T>) {
  return (item.type === 'item' || item.type === 'sub') && !item.disabled;
}

export function getItems<ID extends DId, T extends DMenuItem<ID>>(arr: DNestedChildren<T>[], items?: DNestedChildren<T>[]) {
  const newItems = ([] as DNestedChildren<T>[]).concat(items ?? []);
  arr.forEach((item) => {
    if (item.type === 'group') {
      if (item.children) {
        getItems(item.children, newItems);
      }
    } else if (checkEnableItem(item)) {
      newItems.push(item);
    }
  });
  return newItems;
}
