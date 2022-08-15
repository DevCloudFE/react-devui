import type { DIconProps } from '../Icon';

import { OrderedListOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function OrderedListOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
