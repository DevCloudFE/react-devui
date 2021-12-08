import { useEffect, useMemo, useRef } from 'react';

import { useImmer } from './immer';

export class ThrottleByAnimationFrame {
  private skip = false;
  private skipCallback?: () => void;
  private tid: number | null = null;
  private lastCallback?: () => void;

  clearTids() {
    if (this.tid) {
      cancelAnimationFrame(this.tid);
      this.tid = null;
    }
  }

  skipThrottle() {
    this.skip = true;
    this.clearTids();
  }

  continueThrottle() {
    this.skip = false;
    if (this.skipCallback) {
      this.skipCallback();
      this.skipCallback = undefined;
    }
  }

  run(cb: () => void) {
    if (this.skip) {
      this.skipCallback = cb;
      return;
    }

    if (this.tid === null) {
      this.lastCallback = cb;
      this.tid = window.requestAnimationFrame(() => {
        if (this.lastCallback) {
          this.lastCallback();
          this.lastCallback = undefined;
        }
        this.tid = null;
      });
    } else {
      this.lastCallback = cb;
    }
  }
}

export function useThrottle() {
  const [throttleByAnimationFrame] = useImmer(() => new ThrottleByAnimationFrame());

  const throttle = useMemo(
    () => ({
      throttleByAnimationFrame,
    }),
    [throttleByAnimationFrame]
  );

  useEffect(() => {
    return () => {
      throttleByAnimationFrame.clearTids();
    };
  }, [throttleByAnimationFrame]);

  return throttle;
}

export function useDebounce() {
  const dataRef = useRef<{ tid: number | null }>({
    tid: null,
  });

  const debounce = useMemo(
    () => ({
      debounceByTime: (cb: () => void, timeout: number) => {
        if (dataRef.current.tid) {
          clearTimeout(dataRef.current.tid);
        }
        dataRef.current.tid = window.setTimeout(() => {
          dataRef.current.tid = null;
          cb();
        }, timeout);
      },
    }),
    []
  );

  useEffect(() => {
    return () => {
      if (dataRef.current.tid) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearTimeout(dataRef.current.tid);
      }
    };
  }, []);

  return debounce;
}
