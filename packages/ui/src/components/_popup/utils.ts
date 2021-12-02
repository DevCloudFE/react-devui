import { fromEvent } from 'rxjs';

let pointerX = 0;
let pointerY = 0;

fromEvent<MouseEvent>(window, 'mousemove').subscribe({
  next: (e) => {
    pointerX = e.clientX;

    pointerY = e.clientY;
  },
});

export function checkOutEl(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return pointerX < rect.left || pointerX > rect.right || pointerY < rect.top || pointerY > rect.bottom;
}
