export function getMaxTime(strs: Array<string | undefined>) {
  const milliseconds: number[] = [];
  strs.forEach((str) => {
    if (str) {
      const matchSeconds = str.match(/[0-9.]+(?=s)/g);
      if (matchSeconds) {
        milliseconds.push(...matchSeconds.map((second) => Number(second) * 1000));
      }

      const matchMilliseconds = str.match(/[0-9.]+(?=ms)/g);
      if (matchMilliseconds) {
        milliseconds.push(...matchMilliseconds.map((second) => Number(second)));
      }
    }
  });

  return milliseconds.sort().pop() ?? 0;
}

export class CssRecord {
  private cssOrigin: Partial<CSSStyleDeclaration> = {};

  setCss(el: HTMLElement, css: Partial<CSSStyleDeclaration>): void {
    for (const [key, value] of Object.entries(css)) {
      const origin = el.style[key];
      el.style[key] = value;
      if (!(key in this.cssOrigin)) {
        this.cssOrigin[key] = origin;
      }
    }
  }

  removeCss(el: HTMLElement, keys: string[]) {
    for (const key of keys) {
      if (key in this.cssOrigin) {
        el.style[key] = this.cssOrigin[key];
        delete this.cssOrigin[key];
      }
    }
  }

  backCss(el: HTMLElement) {
    this.removeCss(el, Object.keys(this.cssOrigin));
  }
}

export class Throttle {
  private tid: number | null = null;
  private debounceTid: number | null = null;
  private skip = false;
  private skipTask: (() => void) | null = null;

  clearTids() {
    if (this.debounceTid) {
      cancelAnimationFrame(this.debounceTid);
      this.debounceTid = null;
    }
    if (this.tid) {
      cancelAnimationFrame(this.tid);
      this.tid = null;
    }
  }

  skipRun() {
    this.clearTids();
    this.skip = true;
  }

  continueRun() {
    if (this.skipTask) {
      this.skipTask();
      this.skipTask = null;
    }
    this.skip = false;
  }

  run(cb: () => void) {
    if (this.skip) {
      this.skipTask = cb;
      return;
    }
    if (this.debounceTid) {
      cancelAnimationFrame(this.debounceTid);
      this.debounceTid = null;
    }

    if (this.tid === null) {
      this.tid = requestAnimationFrame(() => (this.tid = null));
      cb();
    } else {
      this.debounceTid = requestAnimationFrame(() => {
        this.debounceTid = null;
        cb();
      });
    }
  }
}
