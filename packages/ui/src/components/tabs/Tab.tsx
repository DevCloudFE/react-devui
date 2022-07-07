import { usePrefixConfig, useTranslation } from '../../hooks';
import { CloseOutlined } from '../../icons';
import { getClassName } from '../../utils';

export interface DTabProps {
  dId: string;
  dPanelId: string;
  dDisabled?: boolean;
  children: React.ReactNode;
  dActive: boolean;
  dClosable?: boolean;
  onActive: () => void;
  onClose: () => void;
  onKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
}

export function DTab(props: DTabProps): JSX.Element | null {
  const { dId, dPanelId, dDisabled, children, dActive, dClosable = false, onActive, onClose, onKeyDown } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation();

  return (
    <div
      id={dId}
      className={getClassName(`${dPrefix}tabs__tab`, {
        'is-active': dActive,
        'is-disabled': dDisabled,
      })}
      tabIndex={dActive && !dDisabled ? 0 : -1}
      role="tab"
      aria-controls={dPanelId}
      aria-selected={dActive}
      aria-disabled={dDisabled}
      onClick={onActive}
      onKeyDown={onKeyDown}
    >
      {children}
      {!dDisabled && dClosable && (
        <button
          className={getClassName(`${dPrefix}icon-button`, `${dPrefix}tabs__close`)}
          aria-label={t('Close')}
          onClick={(e) => {
            e.stopPropagation();

            onClose();
          }}
        >
          <CloseOutlined dSize={14} />
        </button>
      )}
    </div>
  );
}
