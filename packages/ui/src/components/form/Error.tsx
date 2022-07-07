import { usePrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';
import { TTANSITION_DURING_FAST } from '../../utils/global';
import { DCollapseTransition } from '../_transition';

export interface DErrorProps {
  dVisible: boolean;
  dMessage: string;
  dStatus: 'error' | 'warning';
  onHidden: () => void;
}

export function DError(props: DErrorProps): JSX.Element | null {
  const { dVisible, dMessage, dStatus = 'error', onHidden } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <DCollapseTransition
      dSize={0}
      dIn={dVisible}
      dDuring={TTANSITION_DURING_FAST}
      dStyles={{
        enter: { opacity: 0 },
        entering: { transition: `height ${TTANSITION_DURING_FAST}ms ease-out, opacity ${TTANSITION_DURING_FAST}ms ease-out` },
        leaving: { opacity: 0, transition: `height ${TTANSITION_DURING_FAST}ms ease-in, opacity ${TTANSITION_DURING_FAST}ms ease-in` },
        leaved: { display: 'none' },
      }}
      dSkipFirstTransition={false}
      afterLeave={onHidden}
    >
      {(ref, collapseStyle) => (
        <div
          ref={ref}
          className={getClassName(`${dPrefix}form__error`, {
            [`${dPrefix}form__error--error`]: dStatus === 'error',
            [`${dPrefix}form__error--warning`]: dStatus === 'warning',
          })}
          style={collapseStyle}
          title={dMessage}
        >
          {dMessage}
        </div>
      )}
    </DCollapseTransition>
  );
}
