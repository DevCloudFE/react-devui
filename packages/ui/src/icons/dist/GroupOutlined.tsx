import type { DIconProps } from '../Icon';

import { GroupOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GroupOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
