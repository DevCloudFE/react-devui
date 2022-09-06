import type { DIconProps } from '../Icon';

import { MoreOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MoreOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
