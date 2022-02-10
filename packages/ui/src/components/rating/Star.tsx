import React, { useCallback, useMemo } from 'react';

import { usePrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';
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

export function DStar(props: DStarProps) {
  const { dName, dValue, dIcon, dChecked, dHoverValue, dDisabled, dHalf, dTooltip, onCheck, onHoverChange } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const halfValue = dValue - 0.5;
  const halfChecked = dValue === halfValue;

  const handleHalfChange = useCallback(() => {
    onCheck(halfValue);
  }, [halfValue, onCheck]);

  const handleHalfMouseEnter = useCallback(() => {
    onHoverChange(halfValue);
  }, [halfValue, onHoverChange]);

  const halfInputNode = useMemo(
    () => (
      <input
        className={`${dPrefix}rating-star__input`}
        type="radio"
        name={dName}
        checked={halfChecked}
        disabled={dDisabled}
        aria-checked={halfChecked}
        onChange={handleHalfChange}
        onMouseEnter={handleHalfMouseEnter}
      />
    ),
    [dDisabled, dName, dPrefix, halfChecked, handleHalfChange, handleHalfMouseEnter]
  );

  const checked = dValue === dChecked;

  const handleChange = useCallback(() => {
    onCheck(dValue);
  }, [dValue, onCheck]);

  const handleMouseEnter = useCallback(() => {
    onHoverChange(dValue);
  }, [dValue, onHoverChange]);

  const inputNode = useMemo(
    () => (
      <input
        className={`${dPrefix}rating-star__input`}
        type="radio"
        name={dName}
        checked={checked}
        disabled={dDisabled}
        aria-checked={checked}
        onChange={handleChange}
        onMouseEnter={handleMouseEnter}
      />
    ),
    [checked, dDisabled, dName, dPrefix, handleChange, handleMouseEnter]
  );

  return (
    <div className={`${dPrefix}rating-star`}>
      {dHalf && (
        <label
          className={getClassName(`${dPrefix}rating-star__icon`, `${dPrefix}rating-star__icon--half`, {
            'is-checked': halfValue <= (dHoverValue ?? dChecked),
          })}
        >
          {dTooltip ? <DTooltip dTitle={dTooltip(halfValue)}>{halfInputNode}</DTooltip> : halfInputNode}
          {dIcon}
        </label>
      )}
      <label
        className={getClassName(`${dPrefix}rating-star__icon`, {
          'is-checked': dValue <= (dHoverValue ?? dChecked),
        })}
      >
        {dTooltip ? <DTooltip dTitle={dTooltip(dValue)}>{inputNode}</DTooltip> : inputNode}
        {dIcon}
      </label>
    </div>
  );
}
