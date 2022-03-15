import type { DIconProps } from '../Icon';

import { PlusCircleOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PlusCircleOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
