import type { DIconProps } from '../Icon';

import { MediumOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MediumOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
