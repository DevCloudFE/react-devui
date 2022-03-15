import type { DIconProps } from '../Icon';

import { UnderlineOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UnderlineOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
