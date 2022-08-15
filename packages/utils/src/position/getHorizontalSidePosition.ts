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
  top = Math.min(Math.max(top, 10), window.innerHeight - height - 10);

  let left = placement === 'right' ? targetRect.left + targetRect.width + offset : targetRect.left - width - offset;
  left = Math.min(Math.max(left, 10), window.innerWidth - width - 10);

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
