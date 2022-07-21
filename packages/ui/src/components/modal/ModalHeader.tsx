import type { DHeaderProps } from '../_header';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DHeader } from '../_header';

export type DModalHeaderProps = Omit<DHeaderProps, 'onClose'>;

export interface DModalHeaderPropsWithPrivate extends DModalHeaderProps {
  __id?: string;
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DModalHeader' });
export function DModalHeader(props: DModalHeaderProps): JSX.Element | null {
  const {
    __id,
    __onClose,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DModalHeaderPropsWithPrivate);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <DHeader
      {...restProps}
      id={restProps.id ?? __id}
      className={getClassName(restProps.className, `${dPrefix}modal-header`)}
      onClose={__onClose}
    ></DHeader>
  );
}
