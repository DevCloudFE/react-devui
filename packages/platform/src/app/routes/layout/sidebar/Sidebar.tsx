import { isUndefined } from 'lodash';
import { useLocation } from 'react-router-dom';

import { useIsomorphicLayoutEffect } from '@react-devui/hooks';
import { DDrawer, DMenu } from '@react-devui/ui';

import { useMenuExpandsState } from '../../../../config/state';
import { useMenu } from '../../../../core';
import { useDeviceQuery } from '../../../hooks';
import styles from './Sidebar.module.scss';

export interface AppSidebarProps {
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}

export function AppSidebar(props: AppSidebarProps): JSX.Element | null {
  const { menuOpen, onMenuOpenChange } = props;

  const deviceMatched = useDeviceQuery();

  const [menu, allItem] = useMenu();
  const location = useLocation();

  const [expands, setExpands] = useMenuExpandsState();
  const hasInit = !isUndefined(expands);
  const active = location.pathname;

  useIsomorphicLayoutEffect(() => {
    if (!hasInit) {
      const findIndex = allItem.findIndex((item) => item.id === active);
      if (findIndex !== -1) {
        setExpands(allItem[findIndex].parentSub);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInit]);

  const menuNode = (phone: boolean) => {
    return hasInit ? (
      <DMenu
        className={styles['app-sidebar__menu']}
        dList={menu}
        dMode={phone ? 'vertical' : menuOpen ? 'vertical' : 'icon'}
        dActive={active}
        dExpands={expands}
        onExpandsChange={setExpands}
      ></DMenu>
    ) : null;
  };

  return deviceMatched === 'phone' ? (
    <DDrawer
      className={styles['app-sidebar__drawer']}
      dVisible={menuOpen}
      dWidth={200}
      dPlacement="left"
      onVisibleChange={onMenuOpenChange}
    >
      {menuNode(true)}
    </DDrawer>
  ) : (
    <div className={styles['app-sidebar']}>{menuNode(false)}</div>
  );
}
