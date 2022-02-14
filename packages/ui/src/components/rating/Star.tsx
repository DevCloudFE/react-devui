import type { DRenderProps } from '../_trigger';

import { useState } from 'react';

import { usePrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';
import { DTrigger } from '../_trigger';
import { DTooltip } from '../tooltip';

export interface DStarProps {
  dName: string;
  dValue: number;
  dIcon: React.ReactNode;
  dChecked: number;
  dHoverValue: number | null;
  dDisabled: boolean;
  dHalf: boolean;
  dTooltip?: (value: number) => React.ReactNode;
  onCheck: (value: number) => void;
  onHoverChange: (value: number) => void;
}

export function DStar(props: DStarProps): JSX.Element | null {
  const { dName, dValue, dIcon, dChecked, dHoverValue, dDisabled, dHalf, dTooltip, onCheck, onHoverChange } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const checked = dValue === dChecked;

  const halfValue = dValue - 0.5;
  const halfChecked = dValue === halfValue;

  const [tooltipValue, setTooltipValue] = useState<number>(dValue);

  const halfInputNode = (renderProps?: DRenderProps) => (
    <input
      className={`${dPrefix}rating-star__input`}
      type="radio"
      name={dName}
      checked={halfChecked}
      disabled={dDisabled}
      aria-checked={halfChecked}
      onChange={() => {
        onCheck(halfValue);
      }}
      onMouseEnter={(e) => {
        renderProps?.onMouseEnter?.(e);

        onHoverChange(halfValue);
      }}
      onMouseLeave={renderProps?.onMouseLeave}
    />
  );
  const inputNode = (renderProps?: DRenderProps) => (
    <input
      className={`${dPrefix}rating-star__input`}
      type="radio"
      name={dName}
      checked={checked}
      disabled={dDisabled}
      aria-checked={checked}
      onChange={() => {
        onCheck(dValue);
      }}
      onMouseEnter={(e) => {
        renderProps?.onMouseEnter?.(e);

        onHoverChange(dValue);
      }}
      onMouseLeave={renderProps?.onMouseLeave}
    />
  );

  const node = (
    <div className={`${dPrefix}rating-star`}>
      {dHalf && (
        <label
          className={getClassName(`${dPrefix}rating-star__icon`, `${dPrefix}rating-star__icon--half`, {
            'is-checked': halfValue <= (dHoverValue ?? dChecked),
          })}
        >
          {dTooltip ? (
            <DTrigger
              dTrigger="hover"
              dRender={halfInputNode}
              onTrigger={(visible) => {
                if (visible) {
                  setTooltipValue(halfValue);
                }
              }}
            ></DTrigger>
          ) : (
            halfInputNode()
          )}
          {dIcon}
        </label>
      )}
      <label
        className={getClassName(`${dPrefix}rating-star__icon`, {
          'is-checked': dValue <= (dHoverValue ?? dChecked),
        })}
      >
        {dTooltip ? (
          <DTrigger
            dTrigger="hover"
            dRender={inputNode}
            onTrigger={(visible) => {
              if (visible) {
                setTooltipValue(dValue);
              }
            }}
          ></DTrigger>
        ) : (
          inputNode()
        )}
        {dIcon}
      </label>
    </div>
  );

  return dTooltip ? <DTooltip dTitle={dTooltip(tooltipValue)}>{node}</DTooltip> : node;
}
