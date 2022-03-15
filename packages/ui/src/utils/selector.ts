export function getPositionedParent(el: HTMLElement) {
  const loop = (_el: HTMLElement): HTMLElement => {
    if (_el.parentElement) {
      const { position } = getComputedStyle(_el.parentElement);
      if (position !== 'static') {
        return _el.parentElement;
      } else {
        return loop(_el.parentElement);
      }
    } else {
      return document.body;
    }
  };
  return loop(el);
}
