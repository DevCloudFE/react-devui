import { isUndefined } from 'lodash';
import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { fromEvent, Subject, takeUntil } from 'rxjs';

import { useImmer } from '../immer';
import { globalEscStack } from './esc';

interface CaptureMethod {
  fromEvent: typeof fromEvent;
}

class BaseAsyncCapture {
  protected tids = new Map<unknown, () => void>();
  protected onDestroy$ = new Subject<void>();

  clearAll() {
    for (const cb of this.tids.values()) {
      cb();
    }
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromEvent(...args: any) {
    return fromEvent(...(args as Parameters<typeof fromEvent>)).pipe(takeUntil(this.onDestroy$));
  }

  setTimeout(handler: TimerHandler, timeout?: number) {
    const tid = window.setTimeout(handler, timeout);
    const clear = () => {
      clearTimeout(tid);
      this.tids.delete(tid);
    };
    this.tids.set(tid, clear);
    return clear;
  }

  requestAnimationFrame(...args: Parameters<typeof requestAnimationFrame>) {
    const tid = requestAnimationFrame(...args);
    const clear = () => {
      cancelAnimationFrame(tid);
      this.tids.delete(tid);
    };
    this.tids.set(tid, clear);
    return clear;
  }

  onResize(el: HTMLElement, handle: () => void, skipFirst = true) {
    let isFirst = true;
    const observer = new ResizeObserver(() => {
      if (skipFirst && isFirst) {
        isFirst = false;
      } else {
        flushSync(() => handle());
      }
    });
    observer.observe(el);
    const tid = Symbol();
    const clear = () => {
      observer.disconnect();
      this.tids.delete(tid);
    };
    this.tids.set(tid, clear);
    return clear;
  }

  onGlobalScroll(cb: (e: UIEvent) => void) {
    const observer = fromEvent<UIEvent>(window, 'scroll', { capture: true, passive: true }).subscribe({
      next: (e) => cb(e),
    });
    const tid = Symbol();
    const clear = () => {
      observer.unsubscribe();
      this.tids.delete(tid);
    };
    this.tids.set(tid, clear);
    return clear;
  }

  onEscKeydown(cb: () => void) {
    const tid = Symbol();
    globalEscStack.stackPush(tid, cb);
    const clear = () => {
      globalEscStack.stackDelete(tid);
      this.tids.delete(tid);
    };
    this.tids.set(tid, clear);
    return clear;
  }
}

export class AsyncCapture extends BaseAsyncCapture {
  private groups = new Map<symbol | string, BaseAsyncCapture>();

  createGroup(id?: string): [Omit<BaseAsyncCapture, 'fromEvent'> & CaptureMethod, symbol | string] {
    let key: symbol | string = Symbol();
    const group = new BaseAsyncCapture();
    if (isUndefined(id)) {
      this.groups.set(key, group);
    } else {
      key = id;
      const oldGroup = this.groups.get(key);
      if (oldGroup) {
        oldGroup.clearAll();
      }
      this.groups.set(key, group);
    }
    return [group, key];
  }

  deleteGroup(id: symbol | string) {
    const group = this.groups.get(id);
    if (group) {
      group.clearAll();
      this.groups.delete(id);
    }
  }

  clearAll() {
    for (const cb of this.tids.values()) {
      cb();
    }
    this.onDestroy$.next();
    this.onDestroy$.complete();

    for (const group of this.groups.values()) {
      group.clearAll();
    }
  }
}

export function useAsync(): Omit<AsyncCapture, 'fromEvent'> & CaptureMethod {
  const [asyncCapture] = useImmer(() => new AsyncCapture());

  useEffect(() => {
    return () => {
      asyncCapture.clearAll();
    };
  }, [asyncCapture]);

  return asyncCapture;
}
