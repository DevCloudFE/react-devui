import { toNumber } from 'lodash';

export function toPx(str: string, toNum?: false): string;
export function toPx(str: string, toNum: true): number;
export function toPx(str: string, toNum?: boolean): number | string {
  let num = 0;
  if (str.length === 0 || /^0(?!\.)/.test(str)) {
    num = 0;
  } else if (/^-?[0-9]+px$/.test(str)) {
    num = toNumber(str.slice(0, str.length - 2));
  } else {
    const el = document.createElement('div');
    el.style.cssText = `visibility:hidden;position:absolute;top:-999px;left:-999px;width:${str};`;
    document.body.appendChild(el);
    num = el.clientWidth;
    document.body.removeChild(el);
  }

  return toNum ? num : num + 'px';
}
