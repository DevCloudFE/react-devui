import { useEffect, useMemo } from 'react';
import { useImmer } from 'use-immer';

class ThrottleByAnimationFrame {
  private tid: number | null = null;
  private debounceTid: number | null = null;

  clearTids() {
    if (this.debounceTid) {
      cancelAnimationFrame(this.debounceTid);
      this.debounceTid = null;
    }
    if (this.tid) {
      cancelAnimationFrame(this.tid);
      this.tid = null;
    }
  }

  run(cb: () => void) {
    if (this.debounceTid) {
      cancelAnimationFrame(this.debounceTid);
      this.debounceTid = null;
    }

    if (this.tid === null) {
      this.tid = requestAnimationFrame(() => (this.tid = null));
      cb();
    } else {
      this.debounceTid = requestAnimationFrame(() => {
        this.debounceTid = null;
        cb();
      });
    }
  }
}

export function useThrottle() {
  const [throttleByAnimationFrame] = useImmer(new ThrottleByAnimationFrame());

  const throttle = useMemo(
    () => ({
      throttleByAnimationFrame: throttleByAnimationFrame.run.bind(throttleByAnimationFrame),
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
