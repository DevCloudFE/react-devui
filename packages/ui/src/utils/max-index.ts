export function getMaxIndex(el: HTMLElement) {
  let maxZIndex = 1000;
  for (let i = 0; i < el.children.length; i++) {
    const zIndex = Number(getComputedStyle(el.children[i]).zIndex);
    if (!Number.isNaN(zIndex)) {
      maxZIndex = Math.max(maxZIndex, zIndex);
    }
  }
  return maxZIndex + 1;
}

export const globalMaxIndexManager = {
  record: new Map<symbol, number>(),

  getMaxIndex(): [symbol, number] {
    const key = Symbol();
    let maxZIndex = 1000;
    for (const num of this.record.values()) {
      maxZIndex = Math.max(maxZIndex, num);
    }
    maxZIndex += 1;
    this.record.set(key, maxZIndex);
    return [key, maxZIndex];
  },

  deleteRecord(key: symbol) {
    this.record.delete(key);
  },
};
