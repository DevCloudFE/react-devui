import type { DIconProps } from '../Icon';

import { ClearOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ClearOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
