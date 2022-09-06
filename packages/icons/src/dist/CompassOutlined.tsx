import type { DIconProps } from '../Icon';

import { CompassOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CompassOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
