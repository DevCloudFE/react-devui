import { useCustomContext, useDComponentConfig, useDPrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';
import { DDropContext } from './Drop';

export type DDragPlaceholderProps = React.HTMLAttributes<HTMLDivElement>;

export function DDragPlaceholder(props: DDragPlaceholderProps) {
  const { className, ...restProps } = useDComponentConfig('drag-placeholder', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  const { dropDirection } = useCustomContext(DDropContext);
  //#endregion

  return (
    <div
      {...restProps}
      className={getClassName(className, `${dPrefix}drag-placeholder`, {
        'is-horizontal': dropDirection === 'horizontal',
      })}
    ></div>
  );
}
