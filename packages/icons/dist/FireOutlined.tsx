import type { DIconProps } from '../Icon';

import { FireOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FireOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
