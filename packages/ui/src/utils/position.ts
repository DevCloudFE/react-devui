import { isUndefined } from 'lodash';

import { getNoTransformElSize, toPx } from './measure';

function getParentPositioned(el: HTMLElement) {
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

export function getFillingStyle(
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
    const parentEl = getParentPositioned(el);
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

export type DPlacement =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'right'
  | 'right-top'
  | 'right-bottom'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'left-top'
  | 'left-bottom';

export function getPopupPlacementStyle(
  popupEl: HTMLElement,
  targetEl: HTMLElement,
  placement: DPlacement,
  offset: number,
  fixed: boolean
): { top: number; left: number };
export function getPopupPlacementStyle(
  popupEl: HTMLElement,
  targetEl: HTMLElement,
  placement: DPlacement,
  offset: number,
  fixed: boolean,
  space: [number, number, number, number]
): { top: number; left: number; placement: DPlacement } | undefined;
export function getPopupPlacementStyle(
  popupEl: HTMLElement,
  targetEl: HTMLElement,
  placement: DPlacement,
  offset = 10,
  fixed = true,
  space?: [number, number, number, number]
): { top: number; left: number; placement?: DPlacement } | undefined {
  const { width, height } = getNoTransformElSize(popupEl);

  const targetRect = targetEl.getBoundingClientRect();

  let offsetTop = 0;
  let offsetLeft = 0;
  if (!fixed) {
    const parentEl = getParentPositioned(popupEl);
    const parentRect = parentEl.getBoundingClientRect();
    offsetTop = parentEl.scrollTop - parentRect.top;
    offsetLeft = parentEl.scrollLeft - parentRect.left;
  }

  const getFixedPosition = (placement: DPlacement) => {
    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = targetRect.top - height - offset;
        left = targetRect.left + (targetRect.width - width) / 2;
        break;

      case 'top-left':
        top = targetRect.top - height - offset;
        left = targetRect.left;
        break;

      case 'top-right':
        top = targetRect.top - height - offset;
        left = targetRect.left + targetRect.width - width;
        break;

      case 'right':
        top = targetRect.top + (targetRect.height - height) / 2;
        left = targetRect.left + targetRect.width + offset;
        break;

      case 'right-top':
        top = targetRect.top;
        left = targetRect.left + targetRect.width + offset;
        break;

      case 'right-bottom':
        top = targetRect.top + targetRect.height - height;
        left = targetRect.left + targetRect.width + offset;
        break;

      case 'bottom':
        top = targetRect.top + targetRect.height + offset;
        left = targetRect.left + (targetRect.width - width) / 2;
        break;

      case 'bottom-left':
        top = targetRect.top + targetRect.height + offset;
        left = targetRect.left;
        break;

      case 'bottom-right':
        top = targetRect.top + targetRect.height + offset;
        left = targetRect.left + targetRect.width - width;
        break;

      case 'left':
        top = targetRect.top + (targetRect.height - height) / 2;
        left = targetRect.left - width - offset;
        break;

      case 'left-top':
        top = targetRect.top;
        left = targetRect.left - width - offset;
        break;

      case 'left-bottom':
        top = targetRect.top + targetRect.height - height;
        left = targetRect.left - width - offset;

        break;

      default:
        break;
    }
    return { top, left };
  };

  if (!isUndefined(space)) {
    const getAutoFixedPosition = (placements: DPlacement[]) => {
      for (const placement of placements) {
        const { top, left } = getFixedPosition(placement);
        const noOver = [top, window.innerWidth - left - width, window.innerHeight - top - height, left].every(
          (num, index) => num >= space[index]
        );
        if (noOver) {
          return { top, left, placement };
        }
      }
    };

    let positionStyle: { top: number; left: number; placement: DPlacement } | undefined;
    if (placement.startsWith('top')) {
      positionStyle = getAutoFixedPosition([
        placement,
        'right',
        'right-top',
        'right-bottom',
        'left',
        'left-top',
        'left-bottom',
        ...(placement === 'top'
          ? (['bottom', 'bottom-left', 'bottom-right'] as const)
          : placement === 'top-left'
          ? (['bottom-left', 'bottom', 'bottom-right'] as const)
          : (['bottom-right', 'bottom', 'bottom-left'] as const)),
      ]);
    }
    if (placement.startsWith('right')) {
      positionStyle = getAutoFixedPosition([
        placement,
        'top',
        'top-left',
        'top-right',
        'bottom',
        'bottom-left',
        'bottom-right',
        ...(placement === 'right'
          ? (['left', 'left-top', 'left-bottom'] as const)
          : placement === 'right-top'
          ? (['left-top', 'left', 'left-bottom'] as const)
          : (['left-bottom', 'left', 'left-top'] as const)),
      ]);
    }
    if (placement.startsWith('bottom')) {
      positionStyle = getAutoFixedPosition([
        placement,
        'right',
        'right-top',
        'right-bottom',
        'left',
        'left-top',
        'left-bottom',
        ...(placement === 'bottom'
          ? (['top', 'top-left', 'top-right'] as const)
          : placement === 'bottom-left'
          ? (['top-left', 'top', 'top-right'] as const)
          : (['top-right', 'top', 'top-left'] as const)),
      ]);
    }
    if (placement.startsWith('left')) {
      positionStyle = getAutoFixedPosition([
        placement,
        'top',
        'top-left',
        'top-right',
        'bottom',
        'bottom-left',
        'bottom-right',
        ...(placement === 'left'
          ? (['right', 'right-top', 'right-bottom'] as const)
          : placement === 'left-top'
          ? (['right-top', 'right', 'right-bottom'] as const)
          : (['right-bottom', 'right', 'right-top'] as const)),
      ]);
    }
    return positionStyle
      ? {
          top: positionStyle.top + offsetTop,
          left: positionStyle.left + offsetLeft,
          placement: positionStyle.placement,
        }
      : undefined;
  } else {
    const positionStyle = getFixedPosition(placement);
    return {
      top: positionStyle.top + offsetTop,
      left: positionStyle.left + offsetLeft,
    };
  }
}

export function getVerticalSideStyle(
  popupEl: HTMLElement,
  targetEl: HTMLElement,
  placement: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right',
  offset = 10
): {
  top: number;
  left: number;
  transformOrigin: string;
  arrowPosition: React.CSSProperties;
} {
  const { width, height } = getNoTransformElSize(popupEl);

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

  if ((placement.includes('top') && top === 10) || (placement.includes('bottom') && top === window.innerHeight - height - 10)) {
    if (popupEl.dataset['verticalSidePosition']) {
      const [top, left, transformOrigin] = popupEl.dataset['verticalSidePosition'].split(',');
      delete popupEl.dataset['verticalSidePosition'];
      return {
        top: Number(top),
        left: Number(left),
        transformOrigin,
        arrowPosition,
      };
    } else {
      popupEl.dataset['verticalSidePosition'] = [top, left, transformOrigin].join();
      return getVerticalSideStyle(
        popupEl,
        targetEl,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (placement.includes('top') ? placement.replace('top', 'bottom') : placement.replace('bottom', 'top')) as any,
        offset
      );
    }
  }

  delete popupEl.dataset['verticalSidePosition'];
  return {
    top,
    left,
    transformOrigin,
    arrowPosition,
  };
}

export function getHorizontalSideStyle(
  popupEl: HTMLElement,
  targetEl: HTMLElement,
  placement: 'right' | 'left',
  offset = 10
): {
  top: number;
  left: number;
  transformOrigin: string;
} {
  const { width, height } = getNoTransformElSize(popupEl);

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
