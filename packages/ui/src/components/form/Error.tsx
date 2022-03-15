import { useRef } from 'react';

import { usePrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';
import { DCollapseTransition } from '../_transition';

export interface DErrorProps {
  dVisible: boolean;
  dMessage: string;
  dStatus: 'error' | 'warning';
  onHidden: () => void;
}

const TTANSITION_DURING = 133;
export function DError(props: DErrorProps): JSX.Element | null {
  const { dVisible, dMessage, dStatus = 'error', onHidden } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const elRef = useRef<HTMLDivElement>(null);
  //#endregion

  return (
    <DCollapseTransition
      dRef={elRef}
      dSize={0}
      dIn={dVisible}
      dDuring={TTANSITION_DURING}
      dStyles={{
        enter: { opacity: 0 },
        entering: { transition: `height ${TTANSITION_DURING}ms ease-out, opacity ${TTANSITION_DURING}ms ease-out` },
        leaving: { opacity: 0, transition: `height ${TTANSITION_DURING}ms ease-in, opacity ${TTANSITION_DURING}ms ease-in` },
        leaved: { display: 'none' },
      }}
      dSkipFirstTransition={false}
      afterLeave={onHidden}
    >
      {(collapseStyle) => (
        <div
          ref={elRef}
          className={getClassName(`${dPrefix}form-error`, {
            [`${dPrefix}form-error--error`]: dStatus === 'error',
            [`${dPrefix}form-error--warning`]: dStatus === 'warning',
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
