import type { DIconProps } from '../Icon';

import { YahooFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function YahooFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
