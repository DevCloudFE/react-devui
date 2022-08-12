import { usePrefixConfig } from '../../hooks';
import { checkNodeExist, getClassName } from '../../utils';

export interface DItemProps {
  children: React.ReactNode;
  dId: string;
  dFocusVisible: boolean;
  dIcon?: React.ReactNode;
  dLevel?: number;
  dDisabled?: boolean;
  onItemClick: () => void;
}

export function DItem(props: DItemProps): JSX.Element | null {
  const { children, dId, dDisabled, dFocusVisible, dIcon, dLevel = 0, onItemClick } = props;

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
      onClick={onItemClick}
    >
      {dFocusVisible && <div className={`${dPrefix}focus-outline`}></div>}
      {checkNodeExist(dIcon) && <div className={`${dPrefix}dropdown__item-icon`}>{dIcon}</div>}
      <div className={`${dPrefix}dropdown__item-content`}>{children}</div>
    </li>
  );
}
