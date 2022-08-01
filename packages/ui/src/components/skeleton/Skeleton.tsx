import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';

export interface DSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  dVariant?: 'text' | 'circular' | 'rect';
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSkeleton' });
export function DSkeleton(props: DSkeletonProps): JSX.Element | null {
  const {
    children,
    dVariant = 'text',

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <div {...restProps} className={getClassName(restProps.className, `${dPrefix}skeleton`, `${dPrefix}skeleton--${dVariant}`)}>
      {dVariant === 'text' && (
        <div className={`${dPrefix}skeleton__placeholder`} aria-hidden>
          t
        </div>
      )}
      {children}
    </div>
  );
}
