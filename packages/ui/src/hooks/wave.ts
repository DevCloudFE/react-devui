import { useCallback, useRef } from 'react';

import { useAsync } from './async';
import { usePrefixConfig } from './d-config';

export function useWave() {
  const dPrefix = usePrefixConfig();

  const dataRef = useRef<(() => void) | null>(null);

  const asyncCapture = useAsync();

  const wave = useCallback(
    (el: HTMLElement, color: string, animation?: string) => {
      asyncCapture.clearAll();
      dataRef.current?.();

      const cssStyleDeclaration = getComputedStyle(el);

      const waveEl: HTMLDivElement = document.createElement('div');

      waveEl.style.borderTopLeftRadius = cssStyleDeclaration.borderTopLeftRadius;
      waveEl.style.borderTopRightRadius = cssStyleDeclaration.borderTopRightRadius;
      waveEl.style.borderBottomRightRadius = cssStyleDeclaration.borderBottomRightRadius;
      waveEl.style.borderBottomLeftRadius = cssStyleDeclaration.borderBottomLeftRadius;
      waveEl.style.position = 'absolute';
      waveEl.style.zIndex = '-5';
      waveEl.style.top = '0';
      waveEl.style.right = '0';
      waveEl.style.bottom = '0';
      waveEl.style.left = '0';
      waveEl.style.backgroundColor = 'transparent';
      waveEl.style.boxShadow = `0px 0px 0px 0px ${color}`;
      waveEl.style.opacity = '0.2';
      waveEl.style.setProperty(`--${dPrefix}wave-color`, color);
      waveEl.style.animation = animation ?? 'wave 0.4s cubic-bezier(0.08, 0.82, 0.17, 1), fade-out 2s cubic-bezier(0.08, 0.82, 0.17, 1)';
      waveEl.style.animationFillMode = 'forwards';

      el.appendChild(waveEl);

      dataRef.current = () => {
        el.removeChild(waveEl);
      };
      asyncCapture.setTimeout(() => {
        dataRef.current = null;
        el.removeChild(waveEl);
      }, 2000);
    },
    [asyncCapture, dPrefix]
  );

  return wave;
}
