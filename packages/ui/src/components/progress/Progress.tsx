import { isUndefined } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useAsync, useForceUpdate, useMount } from '../../hooks';
import { CheckCircleFilled, CheckOutlined, CloseCircleFilled, CloseOutlined, ExclamationOutlined, WarningFilled } from '../../icons';
import { registerComponentMate, getClassName, checkNodeExist } from '../../utils';

function ease(k: number) {
  return 0.5 * (1 - Math.cos(Math.PI * k));
}

export interface DProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dPercent?: number;
  dType?: 'line' | 'circle' | 'dashboard';
  dStatus?: 'success' | 'warning' | 'error' | 'process';
  dWave?: boolean;
  dLineCap?: CanvasLineCap;
  dLinearGradient?: (gradient: CanvasGradient) => void;
  dGapDegree?: number;
  dLabel?: React.ReactNode;
  dSize?: number;
  dLineWidth?: number;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DProgress' });
export function DProgress(props: DProgressProps): JSX.Element | null {
  const {
    dPercent = 0,
    dType = 'line',
    dStatus,
    dWave = false,
    dLineCap = 'round',
    dLinearGradient,
    dGapDegree = 0.55 * Math.PI,
    dLabel,
    dSize,
    dLineWidth = 8,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  //#endregion

  const dataRef = useRef<{
    wavePercent: number;
    waveLoopFn?: (startTime: number) => void;
    transitionLoopFn?: (startTime: number, startPercent: number) => void;
    clearWaveTid?: () => void;
    clearTransitionTid?: () => void;
  }>({ wavePercent: 0 });

  const asyncCapture = useAsync();

  const status = isUndefined(dStatus) && dPercent === 100 ? 'success' : dStatus;
  const theme = status === 'success' ? 'success' : status === 'warning' ? 'warning' : status === 'error' ? 'danger' : 'primary';

  const [percent, setPercent] = useState(dPercent);

  const drawLine = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const { width } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = dLineWidth;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const overSize = dLineCap === 'butt' ? 0 : dLineWidth / 2;

        ctx.clearRect(0, 0, width, dLineWidth);
        ctx.lineWidth = dLineWidth;
        ctx.lineCap = dLineCap;

        ctx.beginPath();
        ctx.moveTo(overSize, dLineWidth / 2);
        ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue(`--${dPrefix}background-color-indicator`);
        ctx.lineTo(width - overSize, dLineWidth / 2);
        ctx.stroke();
        ctx.closePath();

        if (percent > 0) {
          ctx.beginPath();
          ctx.moveTo(overSize, dLineWidth / 2);
          const gradient = ctx.createLinearGradient(overSize, dLineWidth / 2, width - overSize, dLineWidth / 2);
          dLinearGradient?.(gradient);
          ctx.strokeStyle = isUndefined(dLinearGradient)
            ? getComputedStyle(canvas).getPropertyValue(`--${dPrefix}color-${theme}`)
            : gradient;
          ctx.lineTo(overSize + (width - overSize * 2) * (percent / 100), dLineWidth / 2);
          ctx.stroke();
          ctx.closePath();
        }
      }
    }
  };

  const arcSize = dSize ?? 120;
  const drawArc = (arc: {
    ctx: CanvasRenderingContext2D;
    startAngle: number;
    endAngle: number;
    strokeStyle: CanvasFillStrokeStyles['strokeStyle'];
  }) => {
    const ctx = arc.ctx;
    ctx.beginPath();
    ctx.arc(arcSize / 2, arcSize / 2, arcSize / 2 - dLineWidth / 2, arc.startAngle, arc.endAngle);
    ctx.strokeStyle = arc.strokeStyle;
    ctx.stroke();
    ctx.closePath();
  };

  const drawCircle = (startAngle: number, gapDegree = 0) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = arcSize;
      canvas.height = arcSize;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, arcSize, arcSize);
        ctx.lineWidth = dLineWidth;
        ctx.lineCap = dLineCap;

        drawArc({
          ctx,
          startAngle,
          endAngle: startAngle + (2 * Math.PI - gapDegree),
          strokeStyle: getComputedStyle(canvas).getPropertyValue(`--${dPrefix}background-color-indicator`),
        });

        if (percent > 0) {
          const gradient = ctx.createLinearGradient(0, 0, arcSize, arcSize);
          dLinearGradient?.(gradient);
          drawArc({
            ctx,
            startAngle: startAngle,
            endAngle: startAngle + (2 * Math.PI - gapDegree) * (percent / 100),
            strokeStyle: isUndefined(dLinearGradient) ? getComputedStyle(canvas).getPropertyValue(`--${dPrefix}color-${theme}`) : gradient,
          });
        }
      }
    }
  };

  const draw = () => {
    dType === 'line'
      ? drawLine()
      : dType === 'circle'
      ? drawCircle(-0.5 * Math.PI)
      : drawCircle(-1.5 * Math.PI + dGapDegree / 2, dGapDegree);
  };

  useEffect(() => {
    draw();
  });

  dataRef.current.waveLoopFn = (startTime) => {
    const time = window.performance.now();
    const elapsed = Math.min((time - startTime) / 1500, 1);
    const speed = ease(elapsed);

    const resetWave = () => {
      dataRef.current.wavePercent = 0;
      draw();

      dataRef.current.clearWaveTid = asyncCapture.setTimeout(() => {
        dataRef.current.waveLoopFn?.(window.performance.now());
      }, 2000);
    };

    if (percent > dataRef.current.wavePercent) {
      dataRef.current.wavePercent = percent * speed;

      if (dataRef.current.wavePercent > 0) {
        draw();

        if (canvasRef.current) {
          const canvas = canvasRef.current;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            if (dType === 'line') {
              const { width } = canvas.getBoundingClientRect();
              const overSize = dLineCap === 'butt' ? 0 : dLineWidth / 2;
              const gradientWidth = Math.max((width * (percent / 100)) / 20, dLineWidth * 1.5);
              const end = overSize + (width - overSize * 2) * (dataRef.current.wavePercent / 100);

              ctx.beginPath();
              ctx.moveTo(end - gradientWidth, dLineWidth / 2);
              const gradient = ctx.createLinearGradient(end - gradientWidth, dLineWidth / 2, end, dLineWidth / 2);
              gradient.addColorStop(0, 'rgb(255 255 255 / 0%)');
              gradient.addColorStop(0.8, 'rgb(255 255 255 / 12%)');
              gradient.addColorStop(1, 'rgb(255 255 255 / 16%)');
              ctx.strokeStyle = gradient;
              ctx.lineTo(end, dLineWidth / 2);
              ctx.stroke();
              ctx.closePath();
            } else {
              const endAngle =
                dType === 'circle'
                  ? -0.5 * Math.PI + 2 * Math.PI * (dataRef.current.wavePercent / 100)
                  : -1.5 * Math.PI + dGapDegree / 2 + (2 * Math.PI - dGapDegree) * (dataRef.current.wavePercent / 100);
              const startAngle = Math.max(endAngle - 0.1 * Math.PI, dType === 'circle' ? -0.5 * Math.PI : -1.5 * Math.PI + dGapDegree / 2);
              const gradient = ctx.createLinearGradient(
                arcSize / 2 + (arcSize / 2) * Math.cos(startAngle),
                arcSize / 2 + (arcSize / 2) * Math.sin(startAngle),
                arcSize / 2 + (arcSize / 2) * Math.cos(endAngle),
                arcSize / 2 + (arcSize / 2) * Math.sin(endAngle)
              );
              gradient.addColorStop(0, 'rgb(255 255 255 / 0%)');
              gradient.addColorStop(0.8, 'rgb(255 255 255 / 12%)');
              gradient.addColorStop(1, 'rgb(255 255 255 / 16%)');
              drawArc({
                ctx,
                startAngle,
                endAngle,
                strokeStyle: gradient,
              });
            }
          }
        }
      }

      if (dataRef.current.wavePercent === percent) {
        resetWave();
      } else {
        dataRef.current.clearWaveTid = asyncCapture.requestAnimationFrame(() => {
          dataRef.current.waveLoopFn?.(startTime);
        });
      }
    } else {
      resetWave();
    }
  };
  useEffect(() => {
    dataRef.current.clearWaveTid?.();

    if (dWave) {
      dataRef.current.waveLoopFn?.(window.performance.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dWave, dType]);

  dataRef.current.transitionLoopFn = (startTime, startPercent) => {
    const time = window.performance.now();
    const elapsed = Math.min((time - startTime) / 300, 1);
    const speed = ease(elapsed);

    const newPercent = startPercent + (dPercent - startPercent) * speed;
    setPercent(newPercent);
    if (newPercent !== dPercent) {
      dataRef.current.clearTransitionTid = asyncCapture.requestAnimationFrame(() => {
        dataRef.current.transitionLoopFn?.(startTime, startPercent);
      });
    }
  };
  useEffect(() => {
    dataRef.current.clearTransitionTid?.();

    if (dPercent !== percent) {
      dataRef.current.transitionLoopFn?.(window.performance.now(), percent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dPercent]);

  const forceUpdate = useForceUpdate();
  useMount(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;

      const cssVars = [
        `--${dPrefix}background-color-indicator`,
        `--${dPrefix}color-primary`,
        `--${dPrefix}color-success`,
        `--${dPrefix}color-warning`,
        `--${dPrefix}color-danger`,
      ];
      let cssVals = cssVars.map((v) => getComputedStyle(canvas).getPropertyValue(v));
      const observer = new MutationObserver(() => {
        const newVals = cssVars.map((v) => getComputedStyle(canvas).getPropertyValue(v));
        if (!newVals.every((v, i) => v === cssVals[i])) {
          cssVals = newVals;
          forceUpdate();
        }
      });
      observer.observe(document.body, { attributeFilter: ['class'] });

      return () => {
        observer.disconnect();
      };
    }
  });

  return (
    <div
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}progress`, `${dPrefix}progress--${dType}`)}
      style={{
        ...restProps.style,
        width: dType === 'line' && isUndefined(dSize) ? '100%' : undefined,
      }}
      role={restProps.role ?? 'progressbar'}
      aria-valuenow={restProps['aria-valuenow'] ?? dPercent}
      aria-valuemin={restProps['aria-valuemin'] ?? 0}
      aria-valuemax={restProps['aria-valuemax'] ?? 100}
    >
      <canvas
        ref={canvasRef}
        width={dType === 'line' ? undefined : arcSize}
        height={dType === 'line' ? undefined : arcSize}
        style={dType === 'line' ? { width: isUndefined(dSize) ? '100%' : dSize, height: dLineWidth } : undefined}
      ></canvas>
      {dLabel !== false && (
        <div
          className={getClassName(`${dPrefix}progress__label`, {
            [`${dPrefix}progress__label--${status}`]: status,
          })}
        >
          {checkNodeExist(dLabel)
            ? dLabel
            : status === 'success'
            ? React.createElement(dType === 'line' ? CheckCircleFilled : CheckOutlined, { className: `${dPrefix}progress__label-icon` })
            : status === 'warning'
            ? React.createElement(dType === 'line' ? WarningFilled : ExclamationOutlined, { className: `${dPrefix}progress__label-icon` })
            : status === 'error'
            ? React.createElement(dType === 'line' ? CloseCircleFilled : CloseOutlined, { className: `${dPrefix}progress__label-icon` })
            : `${dPercent}%`}
        </div>
      )}
    </div>
  );
}
