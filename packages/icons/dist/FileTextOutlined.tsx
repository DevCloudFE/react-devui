import type { DIconProps } from '../Icon';

import { FileTextOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileTextOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
