import type { DFormControl } from '../form';

import { isUndefined } from 'lodash';
import { useId, useState } from 'react';

import { usePrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';
import { DTrigger } from '../_trigger';
import { DTooltip } from '../tooltip';

export interface DStarProps {
  name: string;
  disabled?: boolean;
  dFormControl?: DFormControl;
  dValue: number;
  dIcon: React.ReactNode;
  dChecked: number | null;
  dHoverValue: number | null;
  dHalf: boolean;
  dTooltip?: (value: number) => React.ReactNode;
  onCheck: (value: number) => void;
  onHoverChange: (value: number) => void;
}

export function DStar(props: DStarProps): JSX.Element | null {
  const { name, disabled, dFormControl, dValue, dIcon, dChecked, dHoverValue, dHalf, dTooltip, onCheck, onHoverChange } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const uniqueId = useId();
  const halfInputId = `${dPrefix}rating-star-half-input-${uniqueId}`;

  const checked = dValue === dChecked;

  const halfValue = dValue - 0.5;
  const halfChecked = halfValue === dChecked;

  const [tooltipValue, setTooltipValue] = useState<number>(dValue);
  const [isFocus, setIsFocus] = useState(false);

  return (
    <DTooltip disabled={isUndefined(dTooltip)} dTitle={dTooltip?.(tooltipValue)}>
      <div
        className={getClassName(`${dPrefix}rating-star`, {
          'is-focus': isFocus,
        })}
      >
        {dHalf && (
          <>
            <DTrigger
              disabled={isUndefined(dTooltip)}
              dTrigger="hover"
              onTrigger={(visible) => {
                if (visible) {
                  setTooltipValue(halfValue);
                }
              }}
            >
              {({ sOnClick, sOnFocus, sOnBlur, sOnMouseEnter, sOnMouseLeave }) => (
                <input
                  {...(halfChecked ? dFormControl?.inputAttrs : undefined)}
                  id={halfInputId}
                  className={getClassName(`${dPrefix}rating-star__input`, `${dPrefix}rating-star__input--half`)}
                  type="radio"
                  name={name}
                  checked={halfChecked}
                  disabled={disabled}
                  aria-checked={halfChecked}
                  onChange={() => {
                    onCheck(halfValue);
                  }}
                  onClick={() => {
                    sOnClick?.();
                  }}
                  onFocus={() => {
                    sOnFocus?.();

                    setIsFocus(true);
                  }}
                  onBlur={() => {
                    sOnBlur?.();

                    setIsFocus(false);
                  }}
                  onMouseEnter={() => {
                    sOnMouseEnter?.();

                    onHoverChange(halfValue);
                  }}
                  onMouseLeave={() => {
                    sOnMouseLeave?.();
                  }}
                />
              )}
            </DTrigger>
            <label
              className={getClassName(`${dPrefix}rating-star__icon`, `${dPrefix}rating-star__icon--half`, {
                'is-checked': halfValue <= (dHoverValue ?? dChecked ?? 0),
              })}
              htmlFor={halfInputId}
            >
              {dIcon}
            </label>
          </>
        )}
        <label
          className={getClassName(`${dPrefix}rating-star__icon`, {
            'is-checked': dValue <= (dHoverValue ?? dChecked ?? 0),
          })}
        >
          <DTrigger
            disabled={isUndefined(dTooltip)}
            dTrigger="hover"
            onTrigger={(visible) => {
              if (visible) {
                setTooltipValue(dValue);
              }
            }}
          >
            {({ sOnClick, sOnFocus, sOnBlur, sOnMouseEnter, sOnMouseLeave }) => (
              <input
                {...(checked ? { ...dFormControl?.inputAttrs, id: dFormControl?.controlId } : undefined)}
                className={`${dPrefix}rating-star__input`}
                type="radio"
                name={name}
                checked={checked}
                disabled={disabled}
                aria-checked={checked}
                onChange={() => {
                  onCheck(dValue);
                }}
                onClick={() => {
                  sOnClick?.();
                }}
                onFocus={() => {
                  sOnFocus?.();

                  setIsFocus(true);
                }}
                onBlur={() => {
                  sOnBlur?.();

                  setIsFocus(false);
                }}
                onMouseEnter={() => {
                  sOnMouseEnter?.();

                  onHoverChange(dValue);
                }}
                onMouseLeave={() => {
                  sOnMouseLeave?.();
                }}
              />
            )}
          </DTrigger>
          {dIcon}
        </label>
      </div>
    </DTooltip>
  );
}
