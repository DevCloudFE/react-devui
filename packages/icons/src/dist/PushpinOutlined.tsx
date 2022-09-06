import type { DIconProps } from '../Icon';

import { PushpinOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PushpinOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
