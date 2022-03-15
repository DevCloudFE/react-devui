import type { DIconProps } from '../Icon';

import { EnterOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EnterOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
