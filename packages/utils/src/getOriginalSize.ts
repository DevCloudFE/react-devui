import { toPx } from './toPx';

export function getOriginalSize(el: HTMLElement) {
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
