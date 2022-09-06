import type { DIconProps } from '../Icon';

import { KeyOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function KeyOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
