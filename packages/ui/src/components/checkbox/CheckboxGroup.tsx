import type { DId } from '../../utils/types';
import type { DFormControl } from '../form';
import type { DCheckboxItem } from './CheckboxGroupRenderer';

import { getClassName } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DCheckboxGroupRenderer } from './CheckboxGroupRenderer';

export interface DCheckboxGroupProps<V extends DId> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dModel?: V[];
  dList: DCheckboxItem<V>[];
  dDisabled?: boolean;
  dVertical?: boolean;
  onModelChange?: (values: V[]) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCheckbox.Group' as const });
export function DCheckboxGroup<V extends DId>(props: DCheckboxGroupProps<V>): JSX.Element | null {
  const {
    dFormControl,
    dList,
    dModel,
    dDisabled = false,
    dVertical = false,
    onModelChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <DCheckboxGroupRenderer
      dFormControl={dFormControl}
      dList={dList}
      dModel={dModel}
      dDisabled={dDisabled}
      dRender={(nodes) => (
        <div
          {...restProps}
          className={getClassName(restProps.className, `${dPrefix}checkbox-group`, {
            [`${dPrefix}checkbox-group--vertical`]: dVertical,
          })}
          role="group"
        >
          {nodes}
        </div>
      )}
      onModelChange={onModelChange}
    />
  );
}
