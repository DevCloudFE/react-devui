import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName, checkNodeExist } from '../../utils';
import { DEmpty } from '../empty';
import { DTableTd } from './TableTd';

export interface DTableEmptyProps extends React.HTMLAttributes<HTMLTableRowElement> {
  dColSpan: number;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTable.Empty' });
export function DTableEmpty(props: DTableEmptyProps): JSX.Element | null {
  const {
    children,
    dColSpan,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <tr {...restProps} className={getClassName(restProps.className, `${dPrefix}table__empty`)}>
      <DTableTd className={`${dPrefix}table__empty-content`} colSpan={dColSpan} dAlign="center">
        {checkNodeExist(children) ? children : <DEmpty></DEmpty>}
      </DTableTd>
    </tr>
  );
}
