import type { DMenuMode } from './Menu';

import { checkNodeExist, getClassName } from '@react-devui/utils';

import { usePrefixConfig } from '../../hooks';
import { DTooltip } from '../tooltip';

export interface DItemProps {
  children: React.ReactNode;
  dId: string;
  dDisabled?: boolean;
  dPosinset: [number, number];
  dMode: DMenuMode;
  dInNav: boolean;
  dActive: boolean;
  dFocusVisible: boolean;
  dIcon?: React.ReactNode;
  dStep: number;
  dSpace: number;
  dLevel?: number;
  onItemClick: () => void;
}

export function DItem(props: DItemProps): JSX.Element | null {
  const {
    children,
    dId,
    dDisabled,
    dPosinset,
    dMode,
    dInNav,
    dActive,
    dFocusVisible,
    dIcon,
    dStep,
    dSpace,
    dLevel = 0,
    onItemClick,
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const inHorizontalNav = dMode === 'horizontal' && dInNav;

  const liNode = (
    <li
      id={dId}
      className={getClassName(`${dPrefix}menu__item`, `${dPrefix}menu__item--basic`, {
        [`${dPrefix}menu__item--horizontal`]: inHorizontalNav,
        [`${dPrefix}menu__item--icon`]: dMode === 'icon' && dInNav,
        'is-active': dActive,
        'is-disabled': dDisabled,
      })}
      style={{ paddingLeft: dSpace + dLevel * dStep }}
      role="menuitem"
      aria-disabled={dDisabled}
      onClick={onItemClick}
    >
      {dFocusVisible && <div className={`${dPrefix}focus-outline`}></div>}
      <div
        className={getClassName(`${dPrefix}menu__indicator`, {
          [`${dPrefix}menu__indicator--first`]: dPosinset[0] === 0 && dPosinset[1] > 1,
          [`${dPrefix}menu__indicator--last`]: dPosinset[0] === dPosinset[1] - 1 && dPosinset[1] > 1,
        })}
      >
        <div style={{ backgroundColor: dLevel === 0 ? 'transparent' : undefined }}></div>
      </div>
      {checkNodeExist(dIcon) && <div className={`${dPrefix}menu__item-icon`}>{dIcon}</div>}
      <div className={`${dPrefix}menu__item-content`}>{children}</div>
    </li>
  );

  return (
    <DTooltip dDisabled={!(dMode === 'icon' && dInNav)} dTitle={children} dPlacement="right">
      {liNode}
    </DTooltip>
  );
}
