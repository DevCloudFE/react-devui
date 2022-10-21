import type { DMenuItem } from '@react-devui/ui/components/menu';

import { useLocation } from 'react-router-dom';

import { DDrawer, DMenu } from '@react-devui/ui';
import { getClassName } from '@react-devui/utils';

import { useMenu } from '../../../../core';
import styles from './Sidebar.module.scss';

export interface AppSidebarProps {
  menuMode: 'vertical' | 'icon';
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}

export function AppSidebar(props: AppSidebarProps): JSX.Element | null {
  const { menuMode, menuOpen, onMenuOpenChange } = props;

  const location = useLocation();

  const [{ menu, expands }, setMenu] = useMenu();

  const active = ((): string | null => {
    const reduceArr = (arr: DMenuItem<string>[]): string | null => {
      for (const item of arr) {
        if (item.id.startsWith(location.pathname)) {
          return item.id;
        }
        if (item.children) {
          const res = reduceArr(item.children);
          if (res) {
            return res;
          }
        }
      }
      return null;
    };
    return reduceArr(menu) ?? null;
  })();

  const menuNode = (md: boolean) => (
    <DMenu
      dWidth={md ? 200 : '100%'}
      dList={menu}
      dMode={md ? menuMode : 'vertical'}
      dActive={active}
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
        onVisibleChange={onMenuOpenChange}
      >
        {menuNode(false)}
      </DDrawer>
      <div className={getClassName(styles['app-sidebar'], 'd-none d-md-block')}>{menuNode(true)}</div>
    </>
  );
}
