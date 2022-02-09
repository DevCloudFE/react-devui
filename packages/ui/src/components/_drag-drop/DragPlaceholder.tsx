import { useCustomContext, usePrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';
import { DDropContext } from './Drop';

export type DDragPlaceholderProps = React.HTMLAttributes<HTMLDivElement>;

export function DDragPlaceholder(props: DDragPlaceholderProps) {
  const { className, ...restProps } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ gDirection }] = useCustomContext(DDropContext);
  //#endregion

  return (
    <div
      {...restProps}
      className={getClassName(className, `${dPrefix}drag-placeholder`, {
        [`${dPrefix}drag-placeholder--horizontal`]: gDirection === 'horizontal',
      })}
    ></div>
  );
}
