import { POSITION_CONFIG } from './config';

export function getHorizontalSidePosition(
  targetEl: HTMLElement,
  popupSize: { width: number; height: number },
  placement: 'right' | 'left',
  offset = 10
): {
  top: number;
  left: number;
  transformOrigin: string;
} {
  const { width, height } = popupSize;

  const targetRect = targetEl.getBoundingClientRect();

  let top = targetRect.top;
  top = Math.min(Math.max(top, POSITION_CONFIG.space), window.innerHeight - height - POSITION_CONFIG.space);

  let left = placement === 'right' ? targetRect.left + targetRect.width + offset : targetRect.left - width - offset;
  left = Math.min(Math.max(left, POSITION_CONFIG.space), window.innerWidth - width - POSITION_CONFIG.space);

  const transformOrigin =
    placement === 'right'
      ? `left ${Math.min(targetRect.top - top + targetRect.height / 2, height)}px`
      : `right ${Math.min(targetRect.top - top + targetRect.height / 2, height)}px`;

  return {
    top,
    left,
    transformOrigin,
  };
}
