import { isNumber, isUndefined } from 'lodash';

const MAX_DURING_TIME = 468;
const MIN_DURING_TIME = 166;

function ease(k: number) {
  return 0.5 * (1 - Math.cos(Math.PI * k));
}

export function scrollTo(
  el: HTMLElement,
  options: {
    top?: number;
    left?: number;
    behavior?: 'instant' | 'smooth';
  },
  onEnd?: () => void
) {
  let tid: number | null = null;

  if (options.behavior === 'instant') {
    if (!isUndefined(options.top)) {
      el.scrollTop = options.top;
    }
    if (!isUndefined(options.left)) {
      el.scrollLeft = options.left;
    }
    onEnd?.();
  } else {
    const startTime = window.performance.now();
    const startTop = el.scrollTop;
    const startLeft = el.scrollLeft;
    const top = options.top;
    const left = options.left;
    const distance = Math.max(isNumber(top) ? Math.abs(top - startTop) : 0, isNumber(left) ? Math.abs(left - startLeft) : 0);
    const during = Math.max(Math.sin((Math.PI / 2) * Math.min(distance / window.innerHeight, 1)) * MAX_DURING_TIME, MIN_DURING_TIME);

    const step = () => {
      const time = window.performance.now();
      const elapsed = Math.min((time - startTime) / during, 1);
      const speed = ease(elapsed);

      let isFinish = true;
      if (top) {
        const currentTop = startTop + (top - startTop) * speed;
        el.scrollTop = currentTop;
        if (currentTop !== top) {
          isFinish = false;
        }
      }
      if (left) {
        const currentLeft = startLeft + (left - startLeft) * speed;
        el.scrollLeft = currentLeft;
        if (currentLeft !== left) {
          isFinish = false;
        }
      }

      if (!isFinish) {
        tid = window.setTimeout(() => {
          tid = null;
          step();
        }, 12);
      } else {
        onEnd?.();
      }
    };
    step();
  }

  return () => {
    tid && clearTimeout(tid);
  };
}

export function scrollElementToView(el: HTMLElement, container: HTMLElement, space = 0) {
  const { top, bottom, height } = el.getBoundingClientRect();
  let { top: containerTop, bottom: containerBottom } = container.getBoundingClientRect();
  const offsetTop = top - containerTop + container.scrollTop;
  containerTop = containerTop + space;
  containerBottom = containerBottom - space;

  if (bottom <= containerTop || (bottom > containerTop && top < containerTop)) {
    container.scrollTop = offsetTop - space;
  } else if ((bottom > containerBottom && top < containerBottom) || top >= containerBottom) {
    container.scrollTop = offsetTop - container.clientHeight + height + space;
  }
}
