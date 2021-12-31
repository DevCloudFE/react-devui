import type { DConfigContextData } from '../../hooks/d-config';

import { useEffect } from 'react';

import { DConfigContext } from '../../hooks/d-config';
import { Notification } from './Notification';

export interface DRootProps extends DConfigContextData {
  children: React.ReactNode;
}

export function DRoot(props: DRootProps) {
  const { children, ...restProps } = props;

  const lang = restProps.i18n?.lang ?? 'en-US';

  useEffect(() => {
    if (lang === 'en-US') {
      document.body.classList.add('CJK');
    } else {
      document.body.classList.remove('CJK');
    }
  }, [lang]);

  return (
    <DConfigContext.Provider value={restProps}>
      {children}
      <Notification></Notification>
    </DConfigContext.Provider>
  );
}
