import type { DIconProps } from '../Icon';

import { SkinOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SkinOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
