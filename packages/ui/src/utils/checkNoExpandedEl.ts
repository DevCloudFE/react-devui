import { isNull } from 'lodash';

export const ESC_CLOSABLE_DATA = 'data-esc-closable';
export function checkNoExpandedEl(el: HTMLElement) {
  return isNull(el.querySelector(`[${ESC_CLOSABLE_DATA}="true"]`));
}
