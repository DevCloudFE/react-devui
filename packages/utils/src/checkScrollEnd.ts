export function checkScrollEnd(el: HTMLElement) {
  return {
    x: el.scrollWidth <= Math.ceil(el.scrollLeft) + el.clientWidth,
    y: el.scrollHeight <= Math.ceil(el.scrollTop) + el.clientHeight,
  };
}
