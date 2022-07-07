import type { DTransitionState } from '../_transition';

import { usePrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';
import { TTANSITION_DURING_FAST } from '../../utils/global';
import { DTransition } from '../_transition';

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

    className,
    style,
    onClick,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const transitionStyles: Partial<Record<DTransitionState, React.CSSProperties>> = {
    enter: { opacity: 0 },
    entering: { transition: `opacity ${TTANSITION_DURING_FAST}ms linear` },
    leaving: { opacity: 0, transition: `opacity ${TTANSITION_DURING_FAST}ms linear` },
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
          className={getClassName(className, `${dPrefix}mask`)}
          style={{
            ...style,
            ...transitionStyles[state],
          }}
          onClick={(e) => {
            onClick?.(e);

            onClose?.();
          }}
        ></div>
      )}
    </DTransition>
  );
}
