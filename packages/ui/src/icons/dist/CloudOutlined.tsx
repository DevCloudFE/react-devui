import type { DIconProps } from '../Icon';

import { CloudOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CloudOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
