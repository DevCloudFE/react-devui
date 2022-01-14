import { useCustomContext, useComponentConfig, usePrefixConfig } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DDropContext } from './Drop';

export type DDragPlaceholderProps = React.HTMLAttributes<HTMLDivElement>;

const { COMPONENT_NAME } = generateComponentMate('DDragPlaceholder');
export function DDragPlaceholder(props: DDragPlaceholderProps) {
  const { className, ...restProps } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ dropDirection }] = useCustomContext(DDropContext);
  //#endregion

  return (
    <div
      {...restProps}
      className={getClassName(className, `${dPrefix}drag-placeholder`, {
        [`${dPrefix}drag-placeholder--horizontal`]: dropDirection === 'horizontal',
      })}
    ></div>
  );
}
