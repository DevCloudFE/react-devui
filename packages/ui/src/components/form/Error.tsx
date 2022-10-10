import { getClassName } from '@react-devui/utils';

import { TTANSITION_DURING_FAST } from '../../utils';
import { DCollapseTransition } from '../_transition';
import { usePrefixConfig } from '../root';

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
      dOriginalSize={{
        height: 'auto',
      }}
      dCollapsedStyle={{
        height: 0,
      }}
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
      {(collapseRef, collapseStyle) => (
        <div
          ref={collapseRef}
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
