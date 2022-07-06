import { isObject, isString, toNumber } from 'lodash';

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
    el.style.cssText = `visibility:hidden;position:absolute;top:-999px;left:-999px;width:${str};`;
    document.body.appendChild(el);
    num = el.clientWidth;
    document.body.removeChild(el);
  }

  return toNum ? num : num + 'px';
}

export function getNoTransformSize(el: HTMLElement) {
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

export function getClassName(...args: unknown[]) {
  const className: string[] = [];

  args.forEach((item) => {
    if (isString(item)) {
      className.push(item);
    } else if (isObject(item)) {
      Object.keys(item).forEach((key) => {
        if (item[key]) {
          className.push(key);
        }
      });
    }
  });

  return className.join(' ');
}

export function getPositionedParent(el: HTMLElement) {
  const loop = (_el: HTMLElement): HTMLElement => {
    if (_el.parentElement) {
      const { position } = getComputedStyle(_el.parentElement);
      if (position !== 'static') {
        return _el.parentElement;
      } else {
        return loop(_el.parentElement);
      }
    } else {
      return document.body;
    }
  };
  return loop(el);
}

export function copy(str: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(str);
  } else {
    let el: HTMLTextAreaElement | null = document.createElement('textarea');
    el.style.cssText = 'position:fixed;opacity:0;';
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    el = null;
  }
}

export function getUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // tslint:disable-next-line: no-bitwise
    const r = (Math.random() * 16) | 0;
    // tslint:disable-next-line: no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
