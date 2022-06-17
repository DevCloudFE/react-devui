import { isUndefined } from 'lodash';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { fromEvent, Subject, takeUntil } from 'rxjs';

import { useUnmount } from '../lifecycle';

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

  onResize(el: HTMLElement, fn: () => any) {
    let isFirst = true;
    const observer = new ResizeObserver(() => {
      if (isFirst) {
        isFirst = false;
      } else {
        flushSync(() => fn());
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
  const [asyncCapture] = useState(() => new AsyncCapture());

  useUnmount(() => {
    asyncCapture.clearAll();
  });

  return asyncCapture;
}
