import { isUndefined } from 'lodash';
import { useContext, useEffect } from 'react';
import { flushSync } from 'react-dom';

import { DConfigContext } from './contex';

export function useContentScrollViewChange(fn?: () => any) {
  const onContentSVChange$ = useContext(DConfigContext).onScrollViewChange$;

  const hasFn = !isUndefined(fn);

  useEffect(() => {
    if (hasFn) {
      const ob = onContentSVChange$?.subscribe({
        next: () => {
          flushSync(() => fn?.());
        },
      });

      return () => {
        ob?.unsubscribe();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFn, onContentSVChange$]);
}
