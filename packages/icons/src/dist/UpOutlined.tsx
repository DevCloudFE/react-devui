import type { DIconProps } from '../Icon';

import { UpOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UpOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
