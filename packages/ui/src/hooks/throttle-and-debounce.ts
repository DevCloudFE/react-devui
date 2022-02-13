import { useEffect, useState } from 'react';

export class ThrottleByAnimationFrame {
  private skip = false;
  private skipCallback?: () => void;
  private tid: number | null = null;
  private lastCallback?: () => void;
  private debounceTid: number | null = null;

  clearTids() {
    if (this.tid) {
      cancelAnimationFrame(this.tid);
      this.tid = null;
    }
    if (this.debounceTid) {
      cancelAnimationFrame(this.debounceTid);
      this.debounceTid = null;
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

    this.lastCallback = cb;
    if (this.tid === null) {
      cb();
      if (this.debounceTid) {
        cancelAnimationFrame(this.debounceTid);
        this.debounceTid = null;
      }
      this.tid = window.requestAnimationFrame(() => {
        this.tid = null;
        this.debounceTid = window.requestAnimationFrame(() => {
          this.debounceTid = null;
          this.lastCallback?.();
        });
      });
    }
  }
}

export function useThrottle() {
  const [throttleByAnimationFrame] = useState(() => new ThrottleByAnimationFrame());

  useEffect(() => {
    return () => {
      throttleByAnimationFrame.clearTids();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    throttleByAnimationFrame,
  };
}
