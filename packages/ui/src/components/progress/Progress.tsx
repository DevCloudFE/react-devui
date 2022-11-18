import { isUndefined } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { useAsync, useId } from '@react-devui/hooks';
import {
  CheckCircleFilled,
  CheckOutlined,
  CloseCircleFilled,
  CloseOutlined,
  DCustomIcon,
  ExclamationOutlined,
  WarningFilled,
} from '@react-devui/icons';
import { checkNodeExist, getClassName, getUID } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';

function ease(k: number) {
  return 0.5 * (1 - Math.cos(Math.PI * k));
}

export interface DProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dPercent?: number;
  dType?: 'line' | 'circle' | 'dashboard';
  dStatus?: 'success' | 'warning' | 'error' | 'process';
  dWave?: boolean;
  dLineCap?: 'butt' | 'round' | 'square' | 'inherit';
  dLinearGradient?: React.ReactElement<React.SVGProps<SVGLinearGradientElement>>;
  dGapDegree?: number;
  dLabel?: React.ReactNode;
  dSize?: number;
  dLineWidth?: number;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DProgress' as const });
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
  const progressRef = useRef<HTMLDivElement>(null);
  //#endregion

  const dataRef = useRef<{
    waveLoopFn?: (startTime: number) => void;
    transitionLoopFn?: (startTime: number, startPercent: number) => void;
    clearWaveTid?: () => void;
    clearTransitionTid?: () => void;
  }>({});

  const async = useAsync();

  const uniqueId = useId();
  const gradientId = `${dPrefix}progress-${uniqueId}`;

  const status = isUndefined(dStatus) && dPercent === 100 ? 'success' : dStatus;
  const theme = status === 'success' ? 'success' : status === 'warning' ? 'warning' : status === 'error' ? 'danger' : 'primary';

  const [percent, setPercent] = useState(dPercent);
  const [wavePercent, setWavePercent] = useState(0);

  const valuenowStroke = isUndefined(dLinearGradient) ? `var(--${dPrefix}color-${theme})` : `url(#${gradientId})`;

  let waveGradient: React.ReactNode = null;

  const [lineWidth, setLineWidth] = useState(0);
  useEffect(() => {
    if (progressRef.current) {
      const observer = new ResizeObserver(() => {
        flushSync(() => {
          if (progressRef.current) {
            const el = progressRef.current.querySelector(`[data-progress-svg="${uniqueId}"]`);
            if (el) {
              setLineWidth(el.clientWidth);
            }
          }
        });
      });
      observer.observe(progressRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [uniqueId]);
  const drawLine = () => {
    const lineProps = {
      x1: dLineCap === 'butt' ? 0 : dLineWidth / 2,
      y1: '50%',
      y2: '50%',
      strokeWidth: dLineWidth,
      strokeLinecap: dLineCap,
    };

    const waveWidth = Math.max((lineWidth * (percent / 100)) / 20, 12);
    const waveX2 = lineProps.x1 + (dLineCap === 'butt' ? lineWidth : lineWidth - dLineWidth) * (wavePercent / 100);
    const waveX1 = Math.max(waveX2 - waveWidth, lineProps.x1);
    const id = getUID();

    waveGradient = (
      <linearGradient id={id} x1={waveX1} y1="50%" x2={waveX2} y2="50%" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fff" stopOpacity={0} />
        <stop offset="80%" stopColor="#fff" stopOpacity={0.12} />
        <stop offset="100%" stopColor="#fff" stopOpacity={0.16} />
      </linearGradient>
    );

    return (
      <>
        <line
          {...lineProps}
          x2={dLineCap === 'butt' ? lineWidth : lineWidth - dLineWidth / 2}
          stroke={`var(--${dPrefix}background-color-indicator)`}
        />
        {percent > 0 && (
          <line
            {...lineProps}
            x2={lineProps.x1 + (dLineCap === 'butt' ? lineWidth : lineWidth - dLineWidth) * (percent / 100)}
            stroke={valuenowStroke}
          />
        )}
        {dWave && wavePercent > 0 && <line {...lineProps} x1={waveX1} x2={waveX2} stroke={`url(#${id})`} />}
      </>
    );
  };

  const arcSize = dSize ?? 120;
  const getCoordinate = (angle: number) => {
    const c = arcSize / 2;
    const r = arcSize / 2 - dLineWidth;

    return [c + Math.sin(angle) * r, dLineWidth + (r - Math.cos(angle) * r)];
  };
  const drawArc = (arc: { startAngle: number; endAngle: number; stroke: string }): React.ReactNode => {
    const r = arcSize / 2 - dLineWidth;
    const angle = arc.endAngle - arc.startAngle;

    return angle === 2 * Math.PI ? (
      <>
        {drawArc({ ...arc, startAngle: 0, endAngle: 1 * Math.PI })}
        {drawArc({ ...arc, startAngle: 1 * Math.PI, endAngle: 2 * Math.PI })}
      </>
    ) : (
      <path
        d={`M ${getCoordinate(arc.startAngle).join()}A ${r} ${r} 0 ${angle > Math.PI ? 1 : 0} 1 ${getCoordinate(arc.endAngle).join()}`}
        fill="none"
        stroke={arc.stroke}
        strokeWidth={dLineWidth}
        strokeLinecap={dLineCap}
      ></path>
    );
  };
  const drawArcWave = (arc: { startAngle: number; endAngle: number }) => {
    const [x1, y1] = getCoordinate(arc.startAngle);
    const [x2, y2] = getCoordinate(arc.endAngle);

    const id = getUID();

    waveGradient = (
      <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fff" stopOpacity={0} />
        <stop offset="80%" stopColor="#fff" stopOpacity={0.12} />
        <stop offset="100%" stopColor="#fff" stopOpacity={0.16} />
      </linearGradient>
    );

    return dWave && wavePercent > 0 && drawArc({ ...arc, stroke: `url(#${id})` });
  };

  const drawCircle = () => {
    const waveEndAngle = 2 * Math.PI * (wavePercent / 100);
    const waveStartAngle = Math.max(waveEndAngle - (2 * Math.PI) / 20, 0);

    return (
      <>
        {drawArc({ startAngle: 0, endAngle: 2 * Math.PI, stroke: `var(--${dPrefix}background-color-indicator)` })}
        {percent > 0 && drawArc({ startAngle: 0, endAngle: 2 * Math.PI * (percent / 100), stroke: valuenowStroke })}
        {drawArcWave({ startAngle: waveStartAngle, endAngle: waveEndAngle })}
      </>
    );
  };

  const drawDashboard = () => {
    const endAngle = Math.PI - dGapDegree / 2;
    const startAngle = -endAngle;

    const waveEndAngle = startAngle + (endAngle - startAngle) * (wavePercent / 100);
    const waveStartAngle = Math.max(waveEndAngle - (2 * Math.PI) / 20, startAngle);

    return (
      <>
        {drawArc({
          startAngle,
          endAngle,
          stroke: `var(--${dPrefix}background-color-indicator)`,
        })}
        {percent > 0 &&
          drawArc({
            startAngle,
            endAngle: startAngle + (endAngle - startAngle) * (percent / 100),
            stroke: valuenowStroke,
          })}
        {drawArcWave({ startAngle: waveStartAngle, endAngle: waveEndAngle })}
      </>
    );
  };

  dataRef.current.waveLoopFn = (startTime) => {
    const time = window.performance.now();
    const elapsed = Math.min((time - startTime) / 1500, 1);
    const speed = ease(elapsed);

    if (wavePercent < percent) {
      setWavePercent(percent * speed);
      dataRef.current.clearWaveTid = async.requestAnimationFrame(() => {
        dataRef.current.waveLoopFn?.(startTime);
      });
    } else {
      setWavePercent(0);
      dataRef.current.clearWaveTid = async.setTimeout(() => {
        dataRef.current.waveLoopFn?.(window.performance.now());
      }, 2000);
    }
  };
  useEffect(() => {
    dataRef.current.clearWaveTid?.();

    if (dWave) {
      dataRef.current.waveLoopFn?.(window.performance.now());
    }
  }, [dWave]);

  dataRef.current.transitionLoopFn = (startTime, startPercent) => {
    const time = window.performance.now();
    const elapsed = Math.min((time - startTime) / 300, 1);
    const speed = ease(elapsed);

    const newPercent = startPercent + (dPercent - startPercent) * speed;
    setPercent(newPercent);
    if (newPercent !== dPercent) {
      dataRef.current.clearTransitionTid = async.requestAnimationFrame(() => {
        dataRef.current.transitionLoopFn?.(startTime, startPercent);
      });
    }
  };
  useEffect(() => {
    dataRef.current.clearTransitionTid?.();

    dataRef.current.transitionLoopFn?.(window.performance.now(), percent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dPercent]);

  const node = dType === 'line' ? drawLine() : dType === 'circle' ? drawCircle() : drawDashboard();

  return (
    <div
      {...restProps}
      ref={progressRef}
      className={getClassName(restProps.className, `${dPrefix}progress`, `${dPrefix}progress--${dType}`)}
      style={{
        ...restProps.style,
        width: dType === 'line' && isUndefined(dSize) ? '100%' : undefined,
      }}
      role="progressbar"
      aria-valuenow={dPercent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <DCustomIcon
        viewBox={dType === 'line' ? `0 0 ${lineWidth} ${dLineWidth}` : `0 0 ${arcSize} ${arcSize}`}
        data-progress-svg={uniqueId}
        dSize={dType === 'line' ? ['100%', dLineWidth] : arcSize}
      >
        <defs>
          {waveGradient}
          {!isUndefined(dLinearGradient) && React.cloneElement(dLinearGradient, { id: gradientId })}
        </defs>
        {node}
      </DCustomIcon>
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
