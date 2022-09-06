import { useMemo } from 'react';

import { useUnmount } from './useUnmount';

class AsyncInstance {
  protected clearFns = new Set<() => void>();

  clearAll() {
    for (const clear of this.clearFns) {
      clear();
    }
  }

  setTimeout(handler: TimerHandler, timeout?: number) {
    const tid = window.setTimeout(handler, timeout);
    const clear = () => {
      clearTimeout(tid);
    };
    this.clearFns.add(clear);

    return clear;
  }

  requestAnimationFrame(...args: Parameters<typeof requestAnimationFrame>) {
    const tid = requestAnimationFrame(...args);
    const clear = () => {
      cancelAnimationFrame(tid);
    };
    this.clearFns.add(clear);

    return clear;
  }
}

export class Async extends AsyncInstance {
  private instances = new Set<AsyncInstance>();

  create(): AsyncInstance {
    const instance = new AsyncInstance();
    this.instances.add(instance);
    return instance;
  }

  override clearAll() {
    for (const clear of this.clearFns) {
      clear();
    }

    for (const instance of this.instances) {
      instance.clearAll();
    }
  }
}

export function useAsync(): Async {
  const async = useMemo(() => new Async(), []);

  useUnmount(() => {
    async.clearAll();
  });

  return async;
}
