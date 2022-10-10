type DVerticalSidePlacement = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';

interface DVerticalSidePosition {
  top: number;
  left: number;
  transformOrigin: string;
  arrowPosition: React.CSSProperties;
}

export function getVerticalSidePosition(
  targetEl: HTMLElement,
  popupSize: { width: number; height: number },
  config: {
    placement: DVerticalSidePlacement;
    offset?: number;
    inWindow?: number | false;
  }
): DVerticalSidePosition {
  const { width, height } = popupSize;
  const { placement, offset = 8, inWindow = false } = config;

  const targetRect = targetEl.getBoundingClientRect();

  const getPosition = (placement: DVerticalSidePlacement, prevPosition?: DVerticalSidePosition): DVerticalSidePosition => {
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
    if (inWindow !== false) {
      top = Math.min(Math.max(top, inWindow), window.innerHeight - height - inWindow);
    }

    let left =
      placement === 'top' || placement === 'bottom'
        ? targetRect.left + (targetRect.width - width) / 2
        : placement === 'top-left' || placement === 'bottom-left'
        ? targetRect.left
        : targetRect.left + targetRect.width - width;
    if (inWindow !== false) {
      left = Math.min(Math.max(left, inWindow), window.innerWidth - width - inWindow);
    }

    const transformOrigin = placement === 'top' || placement === 'top-left' || placement === 'top-right' ? 'center bottom' : 'center top';

    const position = {
      top,
      left,
      transformOrigin,
      arrowPosition,
    };

    if (
      inWindow !== false &&
      ((placement.includes('top') && top === inWindow) || (placement.includes('bottom') && top === window.innerHeight - height - inWindow))
    ) {
      if (prevPosition) {
        return prevPosition;
      } else {
        return getPosition(
          placement.includes('top')
            ? (placement.replace('top', 'bottom') as DVerticalSidePlacement)
            : (placement.replace('bottom', 'top') as DVerticalSidePlacement),
          position
        );
      }
    }

    return position;
  };

  return getPosition(placement);
}
