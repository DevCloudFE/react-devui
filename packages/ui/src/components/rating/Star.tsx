import type { DFormControl } from '../form';

import { isUndefined } from 'lodash';
import { useId, useState } from 'react';

import { usePrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';
import { DBaseInput } from '../_base-input';
import { DTooltip } from '../tooltip';

export interface DStarProps {
  dFormControl?: DFormControl;
  dValue: number;
  dName?: string;
  dDisabled?: boolean;
  dIcon: React.ReactNode;
  dChecked: number | null;
  dHoverValue: number | null;
  dHalf: boolean;
  dTooltip?: (value: number) => React.ReactNode;
  onCheck: (value: number) => void;
  onHoverChange: (value: number) => void;
}

export function DStar(props: DStarProps) {
  const { dFormControl, dValue, dName, dDisabled, dIcon, dChecked, dHoverValue, dHalf, dTooltip, onCheck, onHoverChange } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const uniqueId = useId();
  const inputId = `${dPrefix}rating-star-input-${uniqueId}`;
  const halfInputId = `${dPrefix}rating-star-half-input-${uniqueId}`;

  const checked = dValue === dChecked;

  const halfValue = dValue - 0.5;
  const halfChecked = halfValue === dChecked;

  const [tooltipValue, setTooltipValue] = useState<number>(dValue);
  const [isFocus, setIsFocus] = useState(false);

  return (
    <DTooltip dDisabled={isUndefined(dTooltip)} dTitle={dTooltip?.(tooltipValue)}>
      <div
        className={getClassName(`${dPrefix}rating__star`, {
          'is-focus': isFocus,
        })}
      >
        {dHalf && (
          <>
            <DBaseInput
              id={halfInputId}
              className={getClassName(`${dPrefix}rating__input`, `${dPrefix}rating__input--half`)}
              type="radio"
              name={dName}
              checked={halfChecked}
              disabled={dDisabled}
              aria-checked={halfChecked}
              dFormControl={dFormControl}
              dFor={halfChecked}
              onChange={() => {
                onCheck(halfValue);
              }}
              onFocus={() => {
                setIsFocus(true);
              }}
              onBlur={() => {
                setIsFocus(false);
              }}
              onMouseEnter={() => {
                if (!isUndefined(dTooltip)) {
                  setTooltipValue(halfValue);
                }

                onHoverChange(halfValue);
              }}
            />
            <label
              className={getClassName(`${dPrefix}rating__icon`, `${dPrefix}rating__icon--half`, {
                'is-checked': halfValue <= (dHoverValue ?? dChecked ?? 0),
              })}
              htmlFor={halfInputId}
            >
              {dIcon}
            </label>
          </>
        )}
        <label
          className={getClassName(`${dPrefix}rating__icon`, {
            'is-checked': dValue <= (dHoverValue ?? dChecked ?? 0),
          })}
        >
          <DBaseInput
            id={inputId}
            className={`${dPrefix}rating__input`}
            type="radio"
            name={dName}
            checked={checked}
            disabled={dDisabled}
            aria-checked={checked}
            dFormControl={dFormControl}
            dFor={checked}
            onChange={() => {
              onCheck(dValue);
            }}
            onFocus={() => {
              setIsFocus(true);
            }}
            onBlur={() => {
              setIsFocus(false);
            }}
            onMouseEnter={() => {
              if (!isUndefined(dTooltip)) {
                setTooltipValue(dValue);
              }

              onHoverChange(dValue);
            }}
          />
          {dIcon}
        </label>
      </div>
    </DTooltip>
  );
}
