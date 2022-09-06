import type { DId } from '../../utils';
import type { DMenuItem } from './Menu';

export function checkEnableItem<ID extends DId, T extends DMenuItem<ID> & { children?: T[] }>(item: T) {
  return (item.type === 'item' || item.type === 'sub') && !item.disabled;
}

export function getSameLevelItems<ID extends DId, T extends DMenuItem<ID> & { children?: T[] }>(arr: T[]) {
  const items: T[] = [];
  const reduceArr = (arr: T[]) => {
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
