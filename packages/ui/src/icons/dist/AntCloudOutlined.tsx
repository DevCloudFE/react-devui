import type { DIconProps } from '../Icon';

import { AntCloudOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AntCloudOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
