import type { DIconProps } from '../Icon';

import { DisconnectOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DisconnectOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
