import { toNumber } from 'lodash';

export function toPx(str: string): string;
export function toPx(str: string, toNum: true): number;
export function toPx(str: string, toNum?: true): number | string {
  let num = 0;
  if (str.length === 0 || /^0(?!\.)/.test(str)) {
    num = 0;
  } else if (/^-?[0-9]+px$/.test(str)) {
    num = toNumber(str.slice(0, str.length - 2));
  } else {
    const el = document.createElement('div');
    el.setAttribute('style', 'visibility: hidden;position: absolute;top: -999px;left: -999px;');
    el.style.width = str;
    document.body.appendChild(el);
    num = el.clientWidth;
    document.body.removeChild(el);
  }

  return toNum ? num : num + 'px';
}

export function getNoTransformElSize(el: HTMLElement) {
  let width = el.clientWidth;
  let height = el.clientHeight;
  const {
    borderTopWidth: _borderTopWidth,
    borderRightWidth: _borderRightWidth,
    borderBottomWidth: _borderBottomWidth,
    borderLeftWidth: _borderLeftWidth,
  } = getComputedStyle(el);
  const borderTopWidth = toPx(_borderTopWidth, true);
  const borderRightWidth = toPx(_borderRightWidth, true);
  const borderBottomWidth = toPx(_borderBottomWidth, true);
  const borderLeftWidth = toPx(_borderLeftWidth, true);

  width = width + borderRightWidth + borderLeftWidth;
  height = height + borderTopWidth + borderBottomWidth;

  return { width, height };
}
