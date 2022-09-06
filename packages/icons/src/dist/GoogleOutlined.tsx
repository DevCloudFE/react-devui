import type { DIconProps } from '../Icon';

import { GoogleOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GoogleOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
