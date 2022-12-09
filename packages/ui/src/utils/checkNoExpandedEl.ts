import { isNull } from 'lodash';

export const EXPANDED_DATA = 'data-popup-expanded';
export function checkNoExpandedEl(el: HTMLElement) {
  return isNull(el.querySelector(`[${EXPANDED_DATA}="true"]`));
}
