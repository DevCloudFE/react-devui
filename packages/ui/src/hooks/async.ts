/* eslint-disable @typescript-eslint/no-explicit-any */
import { isUndefined } from 'lodash';
import { useEffect } from 'react';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { useImmer } from 'use-immer';

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

  setTimeout(handler: TimerHandler, timeout?: number) {
    const tid = window.setTimeout(handler, timeout);
    this.tids.set(tid, () => clearTimeout(tid));
    return tid;
  }
  clearTimeout(tid: number) {
    window.clearTimeout(tid);
    this.tids.delete(tid);
  }

  requestAnimationFrame(...args: Parameters<typeof requestAnimationFrame>) {
    const tid = requestAnimationFrame(...args);
    this.tids.set(tid, () => cancelAnimationFrame(tid));
    return tid;
  }
  cancelAnimationFrame(tid: number) {
    cancelAnimationFrame(tid);
    this.tids.delete(tid);
  }

  fromEvent(...args: any) {
    return fromEvent(...(args as Parameters<typeof fromEvent>)).pipe(takeUntil(this.onDestroy$));
  }

  onResize(el: HTMLElement, handle: () => void, skipFirst = true) {
    let isFirst = true;
    const observer = new ResizeObserver(() => {
      if (skipFirst && isFirst) {
        isFirst = false;
      } else {
        handle();
      }
    });
    observer.observe(el);
    this.tids.set(Symbol(), () => observer.disconnect());
  }
  cancelResize(tid: symbol) {
    const cb = this.tids.get(tid);
    cb?.();
  }
}

class AsyncCapture extends BaseAsyncCapture {
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
    for (const group of this.groups.values()) {
      group.clearAll();
    }
  }
}

export function useAsync(): Omit<AsyncCapture, 'fromEvent'> & CaptureMethod {
  const [asyncCapture] = useImmer(new AsyncCapture());

  useEffect(() => {
    return () => {
      asyncCapture.clearAll();
    };
  }, [asyncCapture]);

  return asyncCapture;
}
