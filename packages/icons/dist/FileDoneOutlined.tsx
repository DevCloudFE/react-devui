import type { DIconProps } from '../Icon';

import { FileDoneOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileDoneOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
