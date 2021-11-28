import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

export const globalEscStack = {
  stack: Array<{ id: unknown; callback: () => void }>(),

  stackPush(id: unknown, callback: () => void) {
    this.stack.push({ id, callback });
  },

  stackPop() {
    const obj = this.stack.pop();
    obj?.callback();
  },

  stackDelete(id: unknown) {
    this.stack = this.stack.filter((item) => item.id !== id);
  },
};

fromEvent<KeyboardEvent>(window, 'keydown')
  .pipe(filter((e) => e.code === 'Escape'))
  .subscribe({
    next: () => {
      globalEscStack.stackPop();
    },
  });
