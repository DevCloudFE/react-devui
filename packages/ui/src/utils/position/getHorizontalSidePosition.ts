import { ROOT_DATA } from '../../components/root';

export function getHorizontalSidePosition(
  targetEl: HTMLElement,
  popupSize: { width: number; height: number },
  config: {
    placement: 'right' | 'left';
    offset?: number;
    inWindow?: number | false;
  }
): {
  top: number;
  left: number;
  transformOrigin: string;
} {
  const { width, height } = popupSize;
  const { placement, offset = 10, inWindow = false } = config;

  const targetRect = targetEl.getBoundingClientRect();

  let top = targetRect.top;
  if (inWindow !== false) {
    top = Math.min(Math.max(top, inWindow), ROOT_DATA.pageSize.height - height - inWindow);
  }
  let left = placement === 'right' ? targetRect.left + targetRect.width + offset : targetRect.left - width - offset;
  if (inWindow !== false) {
    left = Math.min(Math.max(left, inWindow), ROOT_DATA.pageSize.width - width - inWindow);
  }

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
