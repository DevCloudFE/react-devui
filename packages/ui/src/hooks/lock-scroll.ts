import { useIsomorphicLayoutEffect } from './layout-effect';

export function useLockScroll(lock: boolean) {
  useIsomorphicLayoutEffect(() => {
    if (lock) {
      const style = document.documentElement.getAttribute('style');
      const scrollTop = document.documentElement.scrollTop;
      const scrollLeft = document.documentElement.scrollLeft;

      if (document.documentElement.scrollHeight > window.innerHeight) {
        document.documentElement.style.position = 'fixed';
        document.documentElement.style.top = -scrollTop + 'px';
        document.documentElement.style.width = '100%';
        document.documentElement.style.height = '100%';
        document.documentElement.style.overflowY = 'scroll';
      }
      if (document.documentElement.scrollWidth > window.innerWidth) {
        document.documentElement.style.position = 'fixed';
        document.documentElement.style.left = -scrollLeft + 'px';
        document.documentElement.style.width = '100%';
        document.documentElement.style.height = '100%';
        document.documentElement.style.overflowX = 'scroll';
      }

      return () => {
        if (style) {
          document.documentElement.setAttribute('style', style);
        } else {
          document.documentElement.removeAttribute('style');
        }

        document.documentElement.scrollTop = scrollTop;
        document.documentElement.scrollLeft = scrollLeft;
      };
    }
  }, [lock]);
}
