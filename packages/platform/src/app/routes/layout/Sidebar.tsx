import { DDrawer, DMenu } from '@react-devui/ui';

import { useDeviceQuery, useMenu } from '../../hooks';

export interface AppSidebarProps {
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}

export function AppSidebar(props: AppSidebarProps): JSX.Element | null {
  const { menuOpen, onMenuOpenChange } = props;

  const deviceMatched = useDeviceQuery();

  const menu = useMenu();

  return deviceMatched === 'phone' ? (
    <DDrawer className="app-layout-sidebar__drawer" dVisible={menuOpen} dWidth={200} dPlacement="left" onVisibleChange={onMenuOpenChange}>
      <DMenu className="app-layout-sidebar__menu" dList={menu}></DMenu>
    </DDrawer>
  ) : (
    <div className="app-layout-sidebar">
      <DMenu className="app-layout-sidebar__menu" dList={menu} dMode={menuOpen ? 'vertical' : 'icon'}></DMenu>
    </div>
  );
}
