import type { DIconProps } from '../Icon';

import { CarryOutOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CarryOutOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
