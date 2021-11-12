import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

export const globalScrollCapture = {
  taskMap: new Map<symbol, (e: Event) => void>(),

  addTask(task: (e: Event) => void): symbol {
    const tid = Symbol();
    this.taskMap.set(tid, task);
    return tid;
  },

  deleteTask(tid: symbol): boolean {
    return this.taskMap.delete(tid);
  },

  clearTask() {
    this.taskMap.clear();
  },
};
fromEvent(window, 'scroll', { capture: true }).subscribe({
  next: (e) => {
    for (const task of globalScrollCapture.taskMap.values()) {
      task(e);
    }
  },
});

export const globalEscStack = {
  stack: Array<{ id: number; callback: () => void }>(),

  stackPush(id: number, callback: () => void) {
    this.stack.push({ id, callback });
  },

  stackPop() {
    const obj = this.stack.pop();
    obj?.callback();
  },

  stackDelete(id: number) {
    this.stack = this.stack.filter((item) => item.id !== id);
  },
};
fromEvent<KeyboardEvent>(document, 'keydown')
  .pipe(filter((e) => e.code === 'Escape'))
  .subscribe({
    next: () => {
      globalEscStack.stackPop();
    },
  });
