import type { DIconProps } from '../Icon';

import { DatabaseOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DatabaseOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
