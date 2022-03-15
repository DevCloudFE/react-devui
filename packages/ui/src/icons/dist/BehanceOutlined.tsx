import type { DIconProps } from '../Icon';

import { BehanceOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BehanceOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
