import { isNull, isUndefined } from 'lodash';
import { useLocation } from 'react-router-dom';

import { useIsomorphicLayoutEffect } from '@react-devui/hooks';
import { DDrawer, DMenu } from '@react-devui/ui';
import { getClassName } from '@react-devui/utils';

import { useMenuState } from '../../../../core';
import { useMenu } from '../../../../core';
import styles from './Sidebar.module.scss';

export interface AppSidebarProps {
  menuMode: 'vertical' | 'icon';
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}

export function AppSidebar(props: AppSidebarProps): JSX.Element | null {
  const { menuMode, menuOpen, onMenuOpenChange } = props;

  const [menu, allItem] = useMenu();
  const location = useLocation();

  const [menuState, setMenuState] = useMenuState();
  const hasInit = !isUndefined(menuState);
  const activeItem = (() => {
    let maxMatch = 0;
    let active = null;
    for (const item of allItem) {
      if (location.pathname.startsWith(item.id)) {
        const match = item.id.match(/\//g)?.length ?? 0;
        if (match > maxMatch) {
          maxMatch = match;
          active = item;
        }
      }
    }
    return active;
  })();

  useIsomorphicLayoutEffect(() => {
    if (!hasInit) {
      setMenuState({
        expands: isNull(activeItem) ? [] : activeItem.parentSub,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInit]);

  const menuNode = (md: boolean) => {
    return hasInit ? (
      <DMenu
        dWidth={md ? 200 : '100%'}
        dList={menu}
        dMode={md ? menuMode : 'vertical'}
        dActive={activeItem?.id ?? null}
        dExpands={menuState.expands}
        onExpandsChange={(expands) => {
          setMenuState((draft) => {
            draft!.expands = expands;
          });
        }}
      ></DMenu>
    ) : null;
  };

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
