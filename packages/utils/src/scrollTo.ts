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
    during?: number;
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
    console.log(Math.min(distance / (isNumber(top) ? el.clientHeight : el.clientWidth), 1));
    const during = Math.max(
      Math.sin((Math.PI / 2) * Math.min(distance / (isNumber(top) ? el.clientHeight : el.clientWidth), 1)) *
        (options.during ?? MAX_DURING_TIME),
      MIN_DURING_TIME
    );

    const step = () => {
      const time = window.performance.now();
      const elapsed = Math.min((time - startTime) / during, 1);
      const speed = ease(elapsed);

      let isFinish = true;
      if (!isUndefined(top)) {
        const currentTop = startTop + (top - startTop) * speed;
        el.scrollTop = currentTop;
        if (currentTop !== top) {
          isFinish = false;
        }
      }
      if (!isUndefined(left)) {
        const currentLeft = startLeft + (left - startLeft) * speed;
        el.scrollLeft = currentLeft;
        if (currentLeft !== left) {
          isFinish = false;
        }
      }

      if (!isFinish) {
        tid = window.requestAnimationFrame(() => {
          tid = null;
          step();
        });
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
