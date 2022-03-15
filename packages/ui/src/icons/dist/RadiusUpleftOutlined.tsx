import type { DIconProps } from '../Icon';

import { RadiusUpleftOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RadiusUpleftOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
