import type { DId } from '../../utils/types';
import type { DMenuItem } from './Menu';

export function checkEnableItem<ID extends DId, T extends DMenuItem<ID>>(item: T) {
  return (item.type === 'item' || item.type === 'sub') && !item.disabled;
}

export function getSameLevelEnableItems<ID extends DId, T extends DMenuItem<ID>>(arr: T[]) {
  const items: T[] = [];
  const reduceArr = (arr: T[]) => {
    for (const item of arr) {
      if (item.type === 'group' && item.children) {
        reduceArr(item.children as T[]);
      } else if (checkEnableItem(item)) {
        items.push(item);
      }
    }
  };
  reduceArr(arr);
  return items;
}
