import type { DIconProps } from '../Icon';

import { MobileOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MobileOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
