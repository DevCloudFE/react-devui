import type { DFormControl } from '../form';

import { isFunction } from 'lodash';
import { useId, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useGeneralContext, useDValue } from '../../hooks';
import { StarFilled } from '../../icons';
import { registerComponentMate, getClassName } from '../../utils';
import { useFormControl } from '../form';
import { DStar } from './Star';

export interface DRatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dModel?: number;
  dName?: string;
  dDisabled?: boolean;
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
    dFormControl,
    dModel,
    dName,
    dDisabled = false,
    dTotal = 5,
    dHalf = false,
    dReadOnly = false,
    dCustomIcon,
    dTooltip,
    onModelChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralContext();
  //#endregion

  const uniqueId = useId();

  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const formControlInject = useFormControl(dFormControl);
  const [value, changeValue] = useDValue<number | null, number>(null, dModel, onModelChange, undefined, formControlInject);

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  return (
    <div
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}rating`, {
        [`${dPrefix}rating--read-only`]: dReadOnly,
        'is-disabled': disabled,
      })}
      role={restProps.role ?? 'radiogroup'}
      onMouseLeave={(e) => {
        restProps.onMouseLeave?.(e);

        setHoverValue(null);
      }}
    >
      {Array(dTotal)
        .fill(0)
        .map((v, i) => (
          <DStar
            key={i + 1}
            dFormControl={dFormControl}
            dName={dName ?? uniqueId}
            dDisabled={disabled || dReadOnly}
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
