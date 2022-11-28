import { isUndefined } from 'lodash';
import { useEffect } from 'react';

import { APP_NAME } from '../config/other';

export const TITLE_CONFIG: {
  default: string;
  separator: string;
  prefix?: string;
  suffix?: string;
} = {
  default: APP_NAME,
  separator: ' - ',
  suffix: APP_NAME,
};

export function usePageTitle(title?: string) {
  useEffect(() => {
    if (isUndefined(title)) {
      document.title = TITLE_CONFIG.default;
    } else {
      const arr = [title];
      if (TITLE_CONFIG.prefix) {
        arr.unshift(TITLE_CONFIG.prefix);
      }
      if (TITLE_CONFIG.suffix) {
        arr.push(TITLE_CONFIG.suffix);
      }
      document.title = arr.join(TITLE_CONFIG.separator ?? ' - ');
    }
    return () => {
      document.title = TITLE_CONFIG.default;
    };
  });
}
