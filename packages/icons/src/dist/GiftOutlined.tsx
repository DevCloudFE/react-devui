import type { DIconProps } from '../Icon';

import { GiftOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GiftOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
