enum ReferenceCount {
  None,
  Once,
  MoreThanOnce,
}

class CacheManager {
  private list = new Map<
    string,
    {
      value: number;
      count: number;
    }
  >();

  constructor() {
    this.clearCache();
  }

  private clearCache(cycle = 5 * 60 * 1000) {
    window.setTimeout(() => {
      for (const [key, obj] of this.list.entries()) {
        if (obj.count === ReferenceCount.None || obj.count === ReferenceCount.Once) {
          this.list.delete(key);
        }
        if (obj.count >= ReferenceCount.MoreThanOnce) {
          obj.count = ReferenceCount.Once;
        }
      }
      this.clearCache();
    }, cycle);
  }

  set(str: string, num: number) {
    this.list.set(str, {
      value: num,
      count: 1,
    });
  }

  get(str: string): number | null {
    const obj = this.list.get(str);
    if (obj) {
      obj.count += 1;
      return obj.value;
    }
    return null;
  }
}

const cacheManager = new CacheManager();

let el: HTMLElement;

export function toPx(str: string): string;
export function toPx(str: string, toNum: true): number;
export function toPx(str: string, toNum?: true): number | string {
  let num = cacheManager.get(str);
  if (num === null) {
    el = document.createElement('div');
    el.setAttribute('style', 'visibility: hidden;position: absolute;top: -999px;left: -999px;');
    el.style.width = str;
    document.body.appendChild(el);
    num = el.clientWidth;
    cacheManager.set(str, num);
    document.body.removeChild(el);
  }

  return toNum ? num : num + 'px';
}

export function getNoTransformElSize(el: HTMLElement) {
  let width = el.clientWidth;
  let height = el.clientHeight;
  const {
    borderTopWidth: _borderTopWidth,
    borderRightWidth: _borderRightWidth,
    borderBottomWidth: _borderBottomWidth,
    borderLeftWidth: _borderLeftWidth,
  } = getComputedStyle(el);
  const borderTopWidth = toPx(_borderTopWidth, true);
  const borderRightWidth = toPx(_borderRightWidth, true);
  const borderBottomWidth = toPx(_borderBottomWidth, true);
  const borderLeftWidth = toPx(_borderLeftWidth, true);

  width = width + borderRightWidth + borderLeftWidth;
  height = height + borderTopWidth + borderBottomWidth;

  return { width, height };
}
