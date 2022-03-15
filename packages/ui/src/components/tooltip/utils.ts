import { isUndefined } from 'lodash';

import { getNoTransformSize, getPositionedParent } from '../../utils';

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
  const { width, height } = getNoTransformSize(popupEl);

  const targetRect = targetEl.getBoundingClientRect();

  let offsetTop = 0;
  let offsetLeft = 0;
  if (!fixed) {
    const parentEl = getPositionedParent(popupEl);
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
