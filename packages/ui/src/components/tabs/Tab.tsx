import { usePrefixConfig, useTranslation } from '../../hooks';
import { CloseOutlined } from '../../icons';
import { getClassName } from '../../utils';

export interface DTabProps {
  id: string;
  panelId: string;
  disabled?: boolean;
  children: React.ReactNode;
  dActive: boolean;
  dClosable?: boolean;
  onActive: () => void;
  onClose: () => void;
  onKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
}

export function DTab(props: DTabProps): JSX.Element | null {
  const { id, panelId, disabled, children, dActive, dClosable = false, onActive, onClose, onKeyDown } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation('Common');

  return (
    <div
      id={id}
      className={getClassName(`${dPrefix}tab`, {
        'is-active': dActive,
        'is-disabled': disabled,
      })}
      tabIndex={dActive && !disabled ? 0 : -1}
      role="tab"
      aria-controls={panelId}
      aria-selected={dActive}
      aria-disabled={disabled}
      onClick={onActive}
      onKeyDown={onKeyDown}
    >
      {children}
      {!disabled && dClosable && (
        <button
          className={getClassName(`${dPrefix}icon-button`, `${dPrefix}tab__close`)}
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
