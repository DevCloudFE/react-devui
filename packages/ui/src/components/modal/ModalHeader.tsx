import type { DHeaderProps } from '../_header';

import { useCallback } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext } from '../../hooks';
import { getClassName } from '../../utils';
import { DHeader } from '../_header';
import { DModalContext } from './Modal';

export type DModalHeaderProps = Omit<DHeaderProps, 'onClose'>;

export function DModalHeader(props: DModalHeaderProps) {
  const { className, ...restProps } = useComponentConfig(DModalHeader.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ modalId, closeModal }] = useCustomContext(DModalContext);
  //#endregion

  const handleClose = useCallback(() => {
    closeModal?.();
  }, [closeModal]);

  return (
    <DHeader
      {...restProps}
      id={modalId ? `${dPrefix}modal-header-${modalId}` : undefined}
      className={getClassName(className, `${dPrefix}modal-header`)}
      onClose={handleClose}
    ></DHeader>
  );
}
