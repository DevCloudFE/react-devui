import { useComponentConfig, useDValue, usePrefixConfig } from '../../hooks';
import { getClassName, registerComponentMate } from '../../utils';

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTable.Expand' });
export interface DTableExpandProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dExpand?: boolean;
  onExpandChange?: (expand: boolean) => void;
}

export function DTableExpand(props: DTableExpandProps): JSX.Element | null {
  const {
    dExpand,
    onExpandChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [expand, changeExpand] = useDValue<boolean>(false, dExpand, onExpandChange);

  return (
    <button
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}table__expand`, {
        'is-expand': expand,
      })}
      onClick={(e) => {
        restProps.onClick?.(e);

        changeExpand((draft) => !draft);
      }}
    ></button>
  );
}
