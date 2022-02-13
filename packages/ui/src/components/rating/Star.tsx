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

  const checked = dValue === dChecked;

  const halfValue = dValue - 0.5;
  const halfChecked = dValue === halfValue;

  const halfInputNode = (
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
      onMouseEnter={() => {
        onHoverChange(halfValue);
      }}
    />
  );
  const inputNode = (
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
      onMouseEnter={() => {
        onHoverChange(dValue);
      }}
    />
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
