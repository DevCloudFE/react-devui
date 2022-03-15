import type { DIconProps } from '../Icon';

import { FlagOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FlagOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
