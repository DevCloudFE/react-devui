import type { DIconProps } from '../Icon';

import { GatewayOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GatewayOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
