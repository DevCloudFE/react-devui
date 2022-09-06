import type { DIconProps } from '../Icon';

import { QqOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function QqOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
