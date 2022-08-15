import type { DIconProps } from '../Icon';

import { LinkedinOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LinkedinOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
