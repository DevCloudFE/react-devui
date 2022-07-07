import { usePrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';

export interface DDropdownItemProps {
  children: React.ReactNode;
  dId: string;
  dFocusVisible: boolean;
  dIcon?: React.ReactNode;
  dLevel?: number;
  dDisabled?: boolean;
  onClick: () => void;
}

export function DDropdownItem(props: DDropdownItemProps): JSX.Element | null {
  const { children, dId, dDisabled, dFocusVisible, dIcon, dLevel = 0, onClick } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <li
      id={dId}
      className={getClassName(`${dPrefix}dropdown__item`, `${dPrefix}dropdown__item--basic`, {
        'is-disabled': dDisabled,
      })}
      style={{ paddingLeft: 12 + dLevel * 16 }}
      role="menuitem"
      aria-disabled={dDisabled}
      onClick={onClick}
    >
      {dFocusVisible && <div className={`${dPrefix}focus-outline`}></div>}
      {dIcon && <div className={`${dPrefix}dropdown__item-icon`}>{dIcon}</div>}
      <div className={`${dPrefix}dropdown__item-content`}>{children}</div>
    </li>
  );
}
