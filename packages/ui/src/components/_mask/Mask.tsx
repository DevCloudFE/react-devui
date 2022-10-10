import type { DTransitionState } from '../_transition';

import { getClassName } from '@react-devui/utils';

import { TTANSITION_DURING_FAST } from '../../utils';
import { DTransition } from '../_transition';
import { usePrefixConfig } from '../root';

export interface DMaskProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dVisible: boolean;
  onClose: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

export function DMask(props: DMaskProps): JSX.Element | null {
  const {
    dVisible,
    onClose,
    afterVisibleChange,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const transitionStyles: Partial<Record<DTransitionState, React.CSSProperties>> = {
    enter: { opacity: 0 },
    entering: {
      transition: ['opacity'].map((attr) => `${attr} ${TTANSITION_DURING_FAST}ms linear`).join(', '),
    },
    leaving: {
      opacity: 0,
      transition: ['opacity'].map((attr) => `${attr} ${TTANSITION_DURING_FAST}ms linear`).join(', '),
    },
    leaved: { display: 'none' },
  };

  return (
    <DTransition
      dIn={dVisible}
      dDuring={TTANSITION_DURING_FAST}
      afterEnter={() => {
        afterVisibleChange?.(true);
      }}
      afterLeave={() => {
        afterVisibleChange?.(false);
      }}
    >
      {(state) => (
        <div
          {...restProps}
          className={getClassName(restProps.className, `${dPrefix}mask`)}
          style={{
            ...restProps.style,
            ...transitionStyles[state],
          }}
          onClick={(e) => {
            restProps.onClick?.(e);

            onClose?.();
          }}
        ></div>
      )}
    </DTransition>
  );
}
