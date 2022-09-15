import { getClassName } from '@react-devui/utils';

import { usePrefixConfig } from '../../hooks';
import { TTANSITION_DURING_FAST } from '../../utils';
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
        entering: {
          transition: ['height', 'padding', 'margin', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_FAST}ms linear`).join(', '),
        },
        leaving: {
          opacity: 0,
          transition: ['height', 'padding', 'margin', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_FAST}ms linear`).join(', '),
        },
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
