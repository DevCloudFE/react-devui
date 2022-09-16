import React from 'react';
import { useLocation } from 'react-router-dom';

import { DDrawer, DMenu } from '@react-devui/ui';

import { useMenuState } from '../../../config/state';
import { useDeviceQuery } from '../../hooks';

export interface AppSidebarProps {
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}

export function AppSidebar(props: AppSidebarProps): JSX.Element | null {
  const { menuOpen, onMenuOpenChange } = props;

  const deviceMatched = useDeviceQuery();

  const [{ menu, expands }, setMenu] = useMenuState();
  const location = useLocation();
  const menuNode = (
    <DMenu
      className="app-layout-sidebar__menu"
      dList={menu}
      dActive={location.pathname}
      dExpands={expands}
      onExpandsChange={(ids) => {
        setMenu((draft) => {
          draft.expands = ids;
        });
      }}
    ></DMenu>
  );

  return deviceMatched === 'phone' ? (
    <DDrawer className="app-layout-sidebar__drawer" dVisible={menuOpen} dWidth={200} dPlacement="left" onVisibleChange={onMenuOpenChange}>
      {menuNode}
    </DDrawer>
  ) : (
    <div className="app-layout-sidebar">{React.cloneElement(menuNode, { dMode: menuOpen ? 'vertical' : 'icon' })}</div>
  );
}
