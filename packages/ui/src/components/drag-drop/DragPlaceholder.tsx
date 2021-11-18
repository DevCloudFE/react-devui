import { useDComponentConfig, useDPrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';

export type DDragPlaceholderProps = React.HTMLAttributes<HTMLDivElement>;

export function DDragPlaceholder(props: DDragPlaceholderProps) {
  const { className, ...restProps } = useDComponentConfig('drag-placeholder', props);

  const dPrefix = useDPrefixConfig();

  return <div {...restProps} className={getClassName(className, `${dPrefix}drag-placeholder`)}></div>;
}
