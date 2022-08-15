export function scrollToView(el: HTMLElement, container: HTMLElement, space = 0) {
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
