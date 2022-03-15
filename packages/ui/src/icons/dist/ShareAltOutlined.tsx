import type { DIconProps } from '../Icon';

import { ShareAltOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ShareAltOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
