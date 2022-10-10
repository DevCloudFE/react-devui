import { checkNodeExist, getClassName } from '@react-devui/utils';

import { usePrefixConfig } from '../root';

export interface DItemProps {
  children: React.ReactNode;
  dId: string;
  dLevel: number;
  dIcon: React.ReactNode | undefined;
  dFocusVisible: boolean;
  dDisabled: boolean;
  onItemClick: () => void;
}

export function DItem(props: DItemProps): JSX.Element | null {
  const { children, dId, dLevel, dIcon, dFocusVisible, dDisabled, onItemClick } = props;

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
