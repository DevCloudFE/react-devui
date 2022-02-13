import type { Updater } from '../../hooks/two-way-binding';

import { isFunction } from 'lodash';
import React, { useId, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralState } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DIcon } from '../icon';
import { DStar } from './Star';

export interface DRatingProps extends React.HTMLAttributes<HTMLDivElement> {
  dFormControlName?: string;
  dModel?: [number, Updater<number>?];
  dName?: string;
  dTotal?: number;
  dHalf?: boolean;
  dDisabled?: boolean;
  dReadOnly?: boolean;
  dCustomIcon?: React.ReactNode | ((value: number) => React.ReactNode);
  dTooltip?: (value: number) => React.ReactNode;
  onModelChange?: (value: number) => void;
}

const { COMPONENT_NAME } = generateComponentMate('DRating');
export function DRating(props: DRatingProps) {
  const {
    dFormControlName,
    dModel,
    dName,
    dTotal = 5,
    dHalf = false,
    dDisabled = false,
    dReadOnly = false,
    dCustomIcon,
    dTooltip,
    onModelChange,
    className,
    onMouseLeave,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralState();
  //#endregion

  const uniqueId = useId();

  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const [value, changeValue, { ariaAttribute, controlDisabled }] = useTwoWayBinding<number>(null, dModel, onModelChange, {
    formControlName: dFormControlName,
  });

  const disabled = dDisabled || gDisabled || controlDisabled;

  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = (e) => {
    onMouseLeave?.(e);

    setHoverValue(null);
  };

  return (
    <div
      {...restProps}
      {...ariaAttribute}
      className={getClassName(className, `${dPrefix}rating`, {
        [`${dPrefix}rating--read-only`]: dReadOnly,
        'is-disabled': disabled,
      })}
      role="radiogroup"
      onMouseLeave={handleMouseLeave}
    >
      {Array(dTotal)
        .fill(0)
        .map((v, i) => (
          <DStar
            key={i + 1}
            dName={dName ?? uniqueId}
            dValue={i + 1}
            dIcon={
              isFunction(dCustomIcon)
                ? dCustomIcon(i + 1)
                : dCustomIcon ?? (
                    <DIcon viewBox="64 64 896 896">
                      <path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 00.6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0046.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z"></path>
                    </DIcon>
                  )
            }
            dChecked={value ?? 0}
            dDisabled={disabled || dReadOnly}
            dHoverValue={hoverValue}
            dHalf={dHalf}
            dTooltip={dTooltip}
            onCheck={(v) => changeValue(v)}
            onHoverChange={(v) => setHoverValue(v)}
          ></DStar>
        ))}
    </div>
  );
}
