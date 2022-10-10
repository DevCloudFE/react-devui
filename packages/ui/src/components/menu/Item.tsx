import type { DMenuMode } from './Menu';

import { useEffect, useState } from 'react';

import { checkNodeExist, getClassName } from '@react-devui/utils';

import { usePrefixConfig } from '../root';
import { DTooltip } from '../tooltip';

export interface DItemProps {
  children: React.ReactNode;
  dId: string;
  dLevel: number;
  dStep: number;
  dSpace: number;
  dIcon: React.ReactNode | undefined;
  dPosinset: [number, number];
  dMode: DMenuMode;
  dInNav: boolean;
  dActive: boolean;
  dFocusVisible: boolean;
  dDisabled: boolean;
  onItemClick: () => void;
}

export function DItem(props: DItemProps): JSX.Element | null {
  const { children, dId, dLevel, dStep, dSpace, dIcon, dPosinset, dMode, dInNav, dActive, dFocusVisible, dDisabled, onItemClick } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const inHorizontalNav = dMode === 'horizontal' && dInNav;

  const _iconMode = dMode === 'icon' && dInNav;
  const [iconMode, setIconMode] = useState(_iconMode);
  useEffect(() => {
    setIconMode(_iconMode);
  }, [_iconMode]);

  const liNode = (
    <li
      id={dId}
      className={getClassName(`${dPrefix}menu__item`, `${dPrefix}menu__item--basic`, {
        [`${dPrefix}menu__item--horizontal`]: inHorizontalNav,
        [`${dPrefix}menu__item--icon`]: iconMode,
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

  return iconMode ? (
    <DTooltip dTitle={children} dPlacement="right">
      {liNode}
    </DTooltip>
  ) : (
    liNode
  );
}
