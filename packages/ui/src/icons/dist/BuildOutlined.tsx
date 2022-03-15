import type { DIconProps } from '../Icon';

import { BuildOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BuildOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
