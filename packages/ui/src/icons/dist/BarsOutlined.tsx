import type { DIconProps } from '../Icon';

import { BarsOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BarsOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
