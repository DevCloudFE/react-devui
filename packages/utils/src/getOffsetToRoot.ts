import { isNull } from 'lodash';

export function getOffsetToRoot(el: HTMLElement | null, direction: 'top' | 'left' = 'top') {
  let offset = 0;
  while (!isNull(el)) {
    offset += el[direction === 'top' ? 'offsetTop' : 'offsetLeft'];
    el = el.offsetParent as HTMLElement | null;
  }

  return offset;
}
