import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DFormControl } from '../form';

import { isFunction } from 'lodash';
import { useId, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralState } from '../../hooks';
import { StarFilled } from '../../icons';
import { registerComponentMate, getClassName } from '../../utils';
import { DStar } from './Star';

export interface DRatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dName?: string;
  dDisabled?: boolean;
  dFormControl?: DFormControl;
  dModel?: [number, DUpdater<number>?];
  dTotal?: number;
  dHalf?: boolean;
  dReadOnly?: boolean;
  dCustomIcon?: React.ReactNode | ((value: number) => React.ReactNode);
  dTooltip?: (value: number) => React.ReactNode;
  onModelChange?: (value: number) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DRating' });
export function DRating(props: DRatingProps): JSX.Element | null {
  const {
    dName,
    dDisabled = false,
    dFormControl,
    dModel,
    dTotal = 5,
    dHalf = false,
    dReadOnly = false,
    dCustomIcon,
    dTooltip,
    onModelChange,

    className,
    onMouseLeave,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralState();
  //#endregion

  const uniqueId = useId();

  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const [value, changeValue] = useTwoWayBinding<number | null, number>(null, dModel, onModelChange, {
    formControl: dFormControl?.control,
  });

  const disabled = dDisabled || gDisabled || dFormControl?.disabled;

  return (
    <div
      {...restProps}
      {...dFormControl?.dataAttrs}
      className={getClassName(className, `${dPrefix}rating`, {
        [`${dPrefix}rating--read-only`]: dReadOnly,
        'is-disabled': disabled,
      })}
      role="radiogroup"
      onMouseLeave={(e) => {
        onMouseLeave?.(e);

        setHoverValue(null);
      }}
    >
      {Array(dTotal)
        .fill(0)
        .map((v, i) => (
          <DStar
            key={i + 1}
            dName={dName ?? uniqueId}
            dDisabled={disabled || dReadOnly}
            dFormControl={dFormControl}
            dValue={i + 1}
            dIcon={isFunction(dCustomIcon) ? dCustomIcon(i + 1) : dCustomIcon ?? <StarFilled />}
            dChecked={value}
            dHoverValue={hoverValue}
            dHalf={dHalf}
            dTooltip={dTooltip}
            onCheck={(v) => changeValue(v)}
            onHoverChange={(v) => setHoverValue(v)}
          ></DStar>
        ))}
    </div>
  );
}
