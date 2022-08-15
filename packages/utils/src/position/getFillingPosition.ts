import { getPositionedParent } from '../getPositionedParent';
import { toPx } from '../toPx';

export function getFillingPosition(
  el: HTMLElement,
  container: HTMLElement,
  fixed = true
): {
  top: number;
  left: number;
  width: number;
  height: number;
} {
  const { borderTopWidth: _borderTopWidth, borderLeftWidth: _borderLeftWidth } = getComputedStyle(container);
  const borderTopWidth = toPx(_borderTopWidth, true);
  const borderLeftWidth = toPx(_borderLeftWidth, true);

  const containerRect = container.getBoundingClientRect();

  let offsetTop = 0;
  let offsetLeft = 0;
  if (!fixed) {
    const parentEl = getPositionedParent(el);
    const parentRect = parentEl.getBoundingClientRect();
    offsetTop = parentEl.scrollTop - parentRect.top;
    offsetLeft = parentEl.scrollLeft - parentRect.left;
  }

  return {
    top: containerRect.top + borderTopWidth + offsetTop,
    left: containerRect.left + borderLeftWidth + offsetLeft,
    width: container.clientWidth,
    height: container.clientHeight,
  };
}
