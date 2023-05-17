import { DDrawer, DMenu } from '@react-devui/ui';
import { getClassName } from '@react-devui/utils';

import { useMenu } from '../../../core';

import styles from './Sidebar.module.scss';

export interface AppSidebarProps {
  menuMode: 'vertical' | 'icon';
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}

export function AppSidebar(props: AppSidebarProps): JSX.Element | null {
  const { menuMode, menuOpen, onMenuOpenChange } = props;

  const [{ menu, active, expands }, setMenu] = useMenu();

  const menuNode = (md: boolean) => (
    <DMenu
      dWidth={md ? 200 : '100%'}
      dList={menu}
      dMode={md ? menuMode : 'vertical'}
      dActive={active?.path}
      dExpands={expands}
      onExpandsChange={(expands) => {
        setMenu((draft) => {
          draft.expands = expands;
        });
      }}
    ></DMenu>
  );

  return (
    <>
      <DDrawer
        className={getClassName(styles['app-sidebar__drawer'], 'd-md-none')}
        dVisible={menuOpen}
        dWidth={200}
        dPlacement="left"
        onClose={() => {
          onMenuOpenChange(false);
        }}
      >
        {menuNode(false)}
      </DDrawer>
      <div className={getClassName(styles['app-sidebar'], 'd-none d-md-block')}>{menuNode(true)}</div>
    </>
  );
}
