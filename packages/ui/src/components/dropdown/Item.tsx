import { LoadingOutlined } from '@react-devui/icons';
import { checkNodeExist, getClassName } from '@react-devui/utils';

import { TTANSITION_DURING_SLOW } from '../../utils';
import { DCollapseTransition } from '../_transition';
import { usePrefixConfig } from '../root';

export interface DItemProps {
  children: React.ReactNode;
  dId: string;
  dLevel: number;
  dIcon: React.ReactNode | undefined;
  dFocusVisible: boolean;
  dLoading: boolean;
  dDisabled: boolean;
  onItemClick: () => void;
}

export function DItem(props: DItemProps): JSX.Element | null {
  const { children, dId, dLevel, dIcon, dFocusVisible, dLoading, dDisabled, onItemClick } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const itemIcon = (loading: boolean, iconRef?: React.RefObject<HTMLDivElement>, style?: React.CSSProperties) => (
    <div ref={iconRef} className={`${dPrefix}dropdown__item-icon`} style={style}>
      {loading ? <LoadingOutlined dSpin /> : dIcon}
    </div>
  );

  return (
    <li
      id={dId}
      className={getClassName(`${dPrefix}dropdown__item`, `${dPrefix}dropdown__item--basic`, {
        'is-disabled': dDisabled || dLoading,
      })}
      style={{ paddingLeft: 12 + dLevel * 16 }}
      role="menuitem"
      aria-disabled={dDisabled || dLoading}
      onClick={onItemClick}
    >
      {dFocusVisible && <div className={`${dPrefix}focus-outline`}></div>}
      {checkNodeExist(dIcon) ? (
        itemIcon(dLoading)
      ) : (
        <DCollapseTransition
          dOriginalSize={{
            width: '',
          }}
          dCollapsedStyle={{
            width: 0,
          }}
          dIn={dLoading}
          dDuring={TTANSITION_DURING_SLOW}
          dHorizontal
          dStyles={{
            entering: {
              transition: ['width', 'padding', 'margin'].map((attr) => `${attr} ${TTANSITION_DURING_SLOW}ms linear`).join(', '),
            },
            leaving: {
              transition: ['width', 'padding', 'margin'].map((attr) => `${attr} ${TTANSITION_DURING_SLOW}ms linear`).join(', '),
            },
            leaved: { display: 'none' },
          }}
          dDestroyWhenLeaved
        >
          {(collapseRef, collapseStyle) => itemIcon(true, collapseRef, collapseStyle)}
        </DCollapseTransition>
      )}
      <div className={`${dPrefix}dropdown__item-content`}>{children}</div>
    </li>
  );
}
