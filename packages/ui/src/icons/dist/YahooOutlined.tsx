import type { DIconProps } from '../Icon';

import { YahooOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function YahooOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
