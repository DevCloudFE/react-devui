import type { DIconProps } from '../Icon';

import { ShrinkOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ShrinkOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
