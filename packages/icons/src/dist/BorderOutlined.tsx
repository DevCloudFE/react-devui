import type { DIconProps } from '../Icon';

import { BorderOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BorderOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
