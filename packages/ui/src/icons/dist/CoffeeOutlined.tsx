import type { DIconProps } from '../Icon';

import { CoffeeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CoffeeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
