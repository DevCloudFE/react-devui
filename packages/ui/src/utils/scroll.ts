import { isUndefined } from 'lodash';

const MAX_DURING_TIME = 468;
const MIN_DURING_TIME = 166;

function ease(k: number) {
  return 0.5 * (1 - Math.cos(Math.PI * k));
}

export class CustomScroll {
  private tid: number | null = null;
  private el: HTMLElement = document.documentElement;
  private startTime = 0;
  private startTop = 0;
  private startLeft = 0;
  private top?: number;
  private left?: number;
  private during = MAX_DURING_TIME;

  private step(onEnd?: () => void) {
    const time = window.performance.now();
    const elapsed = Math.min((time - this.startTime) / this.during, 1);
    const speed = ease(elapsed);

    let isFinish = true;
    if (this.top) {
      const currentTop = this.startTop + (this.top - this.startTop) * speed;
      this.el.scrollTop = currentTop;
      if (currentTop !== this.top) {
        isFinish = false;
      }
    }
    if (this.left) {
      const currentLeft = this.startLeft + (this.left - this.startLeft) * speed;
      this.el.scrollLeft = currentLeft;
      if (currentLeft !== this.left) {
        isFinish = false;
      }
    }

    if (!isFinish) {
      this.tid = window.setTimeout(() => {
        this.tid = null;
        this.step();
      }, 12);
    } else {
      onEnd?.();
    }
  }

  private getDuring() {
    let top = 0;
    if (this.top) {
      top = Math.abs(this.top - this.startTop);
    }

    let left = 0;
    if (this.left) {
      left = Math.abs(this.left - this.startLeft);
    }

    const distance = Math.max(top, left);

    this.during = Math.max(Math.sin((Math.PI / 2) * Math.min(distance / window.innerHeight, 1)) * MAX_DURING_TIME, MIN_DURING_TIME);
  }

  scrollTo(
    el: HTMLElement,
    options: {
      top?: number;
      left?: number;
      behavior?: 'instant' | 'smooth';
    },
    onEnd?: () => void
  ) {
    if (this.tid) {
      clearTimeout(this.tid);
    }
    if (options.behavior === 'instant') {
      if (!isUndefined(options.top)) {
        el.scrollTop = options.top;
      }
      if (!isUndefined(options.left)) {
        el.scrollLeft = options.left;
      }
      onEnd?.();
    } else {
      this.el = el;
      this.startTime = window.performance.now();
      this.startTop = el.scrollTop;
      this.startLeft = el.scrollLeft;
      this.top = options.top;
      this.left = options.left;
      this.getDuring();
      this.step(onEnd);
    }
  }
}
