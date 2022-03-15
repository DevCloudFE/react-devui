import { toPx } from './measure';
import { getPositionedParent } from './selector';

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

interface DVerticalSidePosition {
  top: number;
  left: number;
  transformOrigin: string;
  arrowPosition: React.CSSProperties;
}
type DVerticalSidePlacement = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
export function getVerticalSidePosition(
  targetEl: HTMLElement,
  popupSize: { width: number; height: number },
  placement: DVerticalSidePlacement,
  offset = 10,
  prevPosition?: DVerticalSidePosition
): DVerticalSidePosition {
  const { width, height } = popupSize;

  const targetRect = targetEl.getBoundingClientRect();

  let arrowPosition: React.CSSProperties = {};

  switch (placement) {
    case 'top':
      arrowPosition = {
        bottom: 0,
        left: '50%',

        transform: 'translate(-50%, 50%) rotate(45deg)',
      };
      break;

    case 'top-left':
      arrowPosition = {
        bottom: 0,
        left: 20,

        transform: 'translate(0, 50%) rotate(45deg)',
      };
      break;

    case 'top-right':
      arrowPosition = {
        right: 20,
        bottom: 0,

        transform: 'translate(0, 50%) rotate(45deg)',
      };
      break;

    case 'bottom':
      arrowPosition = {
        top: 0,
        left: '50%',

        transform: 'translate(-50%, -50%) rotate(45deg)',
      };
      break;

    case 'bottom-left':
      arrowPosition = {
        top: 0,
        left: 20,

        transform: 'translate(0, -50%) rotate(45deg)',
      };
      break;

    case 'bottom-right':
      arrowPosition = {
        top: 0,
        right: 20,

        transform: 'translate(0, -50%) rotate(45deg)',
      };
      break;

    default:
      break;
  }

  let top =
    placement === 'top' || placement === 'top-left' || placement === 'top-right'
      ? targetRect.top - height - offset
      : targetRect.top + targetRect.height + offset;
  top = Math.min(Math.max(top, 10), window.innerHeight - height - 10);

  const left =
    placement === 'top' || placement === 'bottom'
      ? targetRect.left + (targetRect.width - width) / 2
      : placement === 'top-left' || placement === 'bottom-left'
      ? targetRect.left
      : targetRect.left + targetRect.width - width;

  const transformOrigin = placement === 'top' || placement === 'top-left' || placement === 'top-right' ? 'center bottom' : 'center top';

  const position = {
    top,
    left,
    transformOrigin,
    arrowPosition,
  };

  if ((placement.includes('top') && top === 10) || (placement.includes('bottom') && top === window.innerHeight - height - 10)) {
    if (prevPosition) {
      return prevPosition;
    } else {
      return getVerticalSidePosition(
        targetEl,
        popupSize,
        placement.includes('top')
          ? (placement.replace('top', 'bottom') as DVerticalSidePlacement)
          : (placement.replace('bottom', 'top') as DVerticalSidePlacement),
        offset,
        position
      );
    }
  }

  return position;
}

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
