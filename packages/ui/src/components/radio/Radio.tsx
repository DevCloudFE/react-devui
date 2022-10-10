import type { DCloneHTMLElement } from '../../utils/types';
import type { DFormControl } from '../form';

import { isUndefined } from 'lodash';
import { useState } from 'react';

import { checkNodeExist, getClassName } from '@react-devui/utils';

import { useWave, useGeneralContext, useDValue } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DBaseDesign } from '../_base-design';
import { DBaseInput } from '../_base-input';
import { DFocusVisible } from '../_focus-visible';
import { useFormControl } from '../form';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DRadioGroup } from './RadioGroup';

export interface DRadioProps extends React.HTMLAttributes<HTMLElement> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: boolean;
  dDisabled?: boolean;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (checked: boolean) => void;
}

export interface DRadioPrivateProps {
  __type?: 'outline' | 'fill';
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DRadio' as const });
export const DRadio: {
  (props: DRadioProps): JSX.Element | null;
  Group: typeof DRadioGroup;
} = (props) => {
  const {
    children,
    dRef,
    dFormControl,
    dModel,
    dDisabled = false,
    dInputRender,
    onModelChange,
    __type,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DRadioProps & DRadioPrivateProps);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  const [waveNode, wave] = useWave();

  const [focusVisible, setFocusVisible] = useState(false);

  const formControlInject = useFormControl(dFormControl);
  const [checked, changeChecked] = useDValue<boolean>(false, dModel, onModelChange, undefined, formControlInject);

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  return (
    <DBaseDesign
      dComposeDesign={{
        active: checked || focusVisible,
        disabled: disabled,
      }}
      dFormDesign={false}
    >
      {({ render: renderBaseDesign }) =>
        renderBaseDesign(
          <label
            {...restProps}
            className={getClassName(restProps.className, `${dPrefix}radio`, {
              [`${dPrefix}radio--button`]: __type,
              [`${dPrefix}radio--button-${__type}`]: __type,
              [`${dPrefix}radio--${gSize}`]: gSize,
              'is-checked': checked,
              'is-focus-visible': focusVisible,
              'is-disabled': disabled,
            })}
            onClick={(e) => {
              restProps.onClick?.(e);

              if (__type === 'fill' || __type === 'outline') {
                wave(`var(--${dPrefix}color-primary)`);
              }
            }}
          >
            <div className={`${dPrefix}radio__input-wrapper`}>
              <DFocusVisible onFocusVisibleChange={setFocusVisible}>
                {({ render: renderFocusVisible }) => (
                  <DBaseInput dFormControl={dFormControl} dLabelFor>
                    {({ render: renderBaseInput }) => {
                      const input = renderFocusVisible(
                        renderBaseInput(
                          <input
                            ref={dRef?.input}
                            className={`${dPrefix}radio__input`}
                            type="radio"
                            checked={checked}
                            disabled={disabled}
                            aria-checked={checked}
                            onChange={() => {
                              changeChecked(true);
                            }}
                          />
                        )
                      );

                      return isUndefined(dInputRender) ? input : dInputRender(input);
                    }}
                  </DBaseInput>
                )}
              </DFocusVisible>
            </div>
            {checkNodeExist(children) && <div className={`${dPrefix}radio__label`}>{children}</div>}
            {waveNode}
          </label>
        )
      }
    </DBaseDesign>
  );
};

DRadio.Group = DRadioGroup;
