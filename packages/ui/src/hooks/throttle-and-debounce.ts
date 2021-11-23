import { useEffect, useMemo, useState } from 'react';

import { useImmer } from './immer';

export class ThrottleByAnimationFrame {
  private skip = false;
  private skipCallback?: () => void;
  private tid: number | null = null;
  private debounceTid: number | null = null;

  clearTids() {
    if (this.debounceTid) {
      clearTimeout(this.debounceTid);
      this.debounceTid = null;
    }
    if (this.tid) {
      clearTimeout(this.tid);
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

    if (this.debounceTid) {
      clearTimeout(this.debounceTid);
    }

    if (this.tid === null) {
      this.tid = window.setTimeout(() => (this.tid = null), 12);
      cb();
    } else {
      this.debounceTid = window.setTimeout(() => {
        this.debounceTid = null;
        cb();
      }, 20);
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
  const [currentData] = useState<{ tid: number | null }>({
    tid: null,
  });

  const debounce = useMemo(
    () => ({
      debounceByTime: (cb: () => void, timeout: number) => {
        if (currentData.tid) {
          clearTimeout(currentData.tid);
        }
        currentData.tid = window.setTimeout(() => {
          currentData.tid = null;
          cb();
        }, timeout);
      },
    }),
    [currentData]
  );

  useEffect(() => {
    return () => {
      if (currentData.tid) {
        clearTimeout(currentData.tid);
      }
    };
  }, [currentData]);

  return debounce;
}
