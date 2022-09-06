import type { DIconProps } from '../Icon';

import { NodeIndexOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function NodeIndexOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
