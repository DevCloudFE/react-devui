import type { DCloneHTMLElement } from '../../utils/types';
import type { DFormControl } from '../form';

import { isUndefined } from 'lodash';

import { checkNodeExist, getClassName } from '@react-devui/utils';

import { useGeneralContext, useDValue } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DBaseInput } from '../_base-input';
import { useFormControl } from '../form';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DCheckboxGroup } from './CheckboxGroup';
import { DCheckboxGroupRenderer } from './CheckboxGroupRenderer';

export interface DCheckboxProps extends React.HTMLAttributes<HTMLElement> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dModel?: boolean;
  dVerticalCenter?: boolean;
  dDisabled?: boolean;
  dIndeterminate?: boolean;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (checked: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCheckbox' as const });
export const DCheckbox: {
  (props: DCheckboxProps): JSX.Element | null;
  Group: typeof DCheckboxGroup;
  GroupRenderer: typeof DCheckboxGroupRenderer;
} = (props) => {
  const {
    children,
    dRef,
    dFormControl,
    dModel,
    dVerticalCenter = false,
    dDisabled = false,
    dIndeterminate = false,
    dInputRender,
    onModelChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralContext();
  //#endregion

  const formControlInject = useFormControl(dFormControl);
  const [checked, changeChecked] = useDValue<boolean | undefined, boolean>(
    false,
    dIndeterminate ? false : dModel,
    onModelChange,
    undefined,
    formControlInject
  );

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  return (
    <label
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}checkbox`, {
        [`${dPrefix}checkbox--vertical-center`]: dVerticalCenter,
        'is-indeterminate': dIndeterminate,
        'is-checked': checked,
        'is-disabled': disabled,
      })}
    >
      <div className={`${dPrefix}checkbox__state-container`}>
        <DBaseInput dFormControl={dFormControl} dLabelFor>
          {({ render: renderBaseInput }) => {
            const input = renderBaseInput(
              <input
                ref={dRef?.input}
                className={`${dPrefix}checkbox__input`}
                type="checkbox"
                disabled={disabled}
                aria-checked={dIndeterminate ? 'mixed' : checked}
                onChange={() => {
                  changeChecked(!checked);
                }}
              />
            );

            return isUndefined(dInputRender) ? input : dInputRender(input);
          }}
        </DBaseInput>
        {dIndeterminate ? (
          <div className={`${dPrefix}checkbox__indeterminate`}></div>
        ) : (
          checked && <div className={`${dPrefix}checkbox__tick`}></div>
        )}
      </div>
      {checkNodeExist(children) && <div className={`${dPrefix}checkbox__label`}>{children}</div>}
    </label>
  );
};

DCheckbox.Group = DCheckboxGroup;
DCheckbox.GroupRenderer = DCheckboxGroupRenderer;
