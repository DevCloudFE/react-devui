import type { DIconProps } from '../Icon';

import { CloseOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CloseOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
