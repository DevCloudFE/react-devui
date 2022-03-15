import { usePrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';

export interface DDropdownItemProps {
  id: string;
  disabled?: boolean;
  children: React.ReactNode;
  dFocusVisible: boolean;
  dIcon?: React.ReactNode;
  dLevel?: number;
  onClick: () => void;
}

export function DDropdownItem(props: DDropdownItemProps): JSX.Element | null {
  const { id, disabled, children, dFocusVisible, dIcon, dLevel = 0, onClick } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <li
      id={id}
      className={getClassName(`${dPrefix}dropdown-item`, {
        'is-disabled': disabled,
      })}
      style={{ paddingLeft: 12 + dLevel * 16 }}
      role="menuitem"
      aria-disabled={disabled}
      onClick={onClick}
    >
      {dFocusVisible && <div className={`${dPrefix}focus-outline`}></div>}
      {dIcon && <div className={`${dPrefix}dropdown-item__icon`}>{dIcon}</div>}
      <div className={`${dPrefix}dropdown-item__title`}>{children}</div>
    </li>
  );
}
