export function getMaxTime(strs: (string | undefined)[]) {
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
