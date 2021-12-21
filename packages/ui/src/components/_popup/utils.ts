import { fromEvent } from 'rxjs';

import { getNoTransformElSize } from '../../utils';

let pointerX = 0;
let pointerY = 0;

fromEvent<MouseEvent>(window, 'mousemove', { capture: true }).subscribe({
  next: (e) => {
    pointerX = e.clientX;

    pointerY = e.clientY;
  },
});

export function checkOutEl(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const { width, height } = getNoTransformElSize(el);
  return pointerX < rect.left || pointerX > rect.left + width || pointerY < rect.top || pointerY > rect.top + height;
}
